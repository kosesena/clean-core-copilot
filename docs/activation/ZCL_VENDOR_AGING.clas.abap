CLASS zcl_vendor_aging DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC.
  " Friendship for the local test class is declared in the test include
  " (LOCAL FRIENDS); a PUBLIC class accepts only GLOBAL FRIENDS here.

  "! Bucketed vendor ageing logic – modernised from ZFI_VENDOR_AGING.
  "!
  "! Verification status : CANDIDATE – class name, consumed CDS view, and
  "!   custom table name are all unverified on the target product/release.
  "!
  "! Target product  : unknown
  "! Target release  : unknown
  "! Language version: ABAP for Cloud Development

  PUBLIC SECTION.

    TYPES:
      "! Single vendor open item, enriched with ageing bucket.
      "! Component names match CDS element names exactly so that
      "! SELECT … INTO CORRESPONDING FIELDS resolves without AS aliases.
      BEGIN OF ty_item,
        CompanyCode                    TYPE bukrs,
        Supplier                       TYPE lifnr,
        AccountingDocument             TYPE belnr_d,
        AccountingDocumentItem         TYPE posnr,    "< candidate element/type; verify on target
        NetDueDate                     TYPE dzfbdt,   "< maps to ZFBDT; verify field type
        AmountInCompanyCodeCurrency    TYPE dmbtr,    "< maps to DMBTR; verify field type
        SupplierName                   TYPE name1_gp, "< candidate field width; verify
        Bucket                         TYPE char10,   "< custom field, not from CDS
      END OF ty_item,
      ty_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.

    "! Run the ageing calculation and write the result log.
    "!
    "! @parameter iv_company_code | Company code (obligatory, maps to P_BUKRS)
    "! @parameter iv_key_date     | Key date for ageing (maps to P_KEYDT,
    "!                              defaults to sy-datum if initial)
    "! @parameter et_items        | Bucketed items (populated on success)
    "! @parameter ev_subrc        | 0 = success, non-zero = error
    METHODS run
      IMPORTING
        iv_company_code TYPE bukrs
        iv_key_date     TYPE sy-datum OPTIONAL
      EXPORTING
        et_items        TYPE ty_items
        ev_subrc        TYPE sysubrc.

    "! !! INTEGRATION POINT – treasury hand-off !!
    "!
    "! Replace this stub with the real outbound mechanism once the
    "! integration architecture is decided (F-05 / F-06).
    "!
    "! Options (human must choose):
    "!   A) HTTP outbound via Communication Arrangement + released HTTP class
    "!   B) Application Job that calls the treasury service directly
    "!   C) Business Event / enterprise messaging
    "!   D) OData feed that treasury system polls
    "!
    "! @parameter it_items | Bucketed items to hand off
    "! @parameter ev_subrc | 0 = success
    METHODS hand_off_to_treasury
      IMPORTING
        it_items TYPE ty_items
      EXPORTING
        ev_subrc TYPE sysubrc.

    "! Test-friend wrapper: exposes assign_buckets to the ABAP Unit test class.
    "! Do NOT call from production code.
    METHODS assign_buckets_for_test
      IMPORTING
        iv_key_date TYPE sy-datum
      CHANGING
        ct_items    TYPE ty_items.

  PRIVATE SECTION.

    CONSTANTS:
      c_bucket_0_30  TYPE char10 VALUE '0-30',
      c_bucket_31_60 TYPE char10 VALUE '31-60',
      c_bucket_60p   TYPE char10 VALUE '60+'.

    "! Bucket threshold: items with age <= this value go into '0-30' bucket.
    CONSTANTS c_threshold_30 TYPE i VALUE 30.   "< business rule from F-01 analysis
    "! Bucket threshold: items with age <= this value go into '31-60' bucket.
    CONSTANTS c_threshold_60 TYPE i VALUE 60.   "< business rule from F-01 analysis

    METHODS select_open_items
      IMPORTING
        iv_company_code TYPE bukrs
      RETURNING
        VALUE(rt_items) TYPE ty_items.

    METHODS assign_buckets
      IMPORTING
        iv_key_date TYPE sy-datum
      CHANGING
        ct_items    TYPE ty_items.

    METHODS write_log
      IMPORTING
        iv_company_code TYPE bukrs.

ENDCLASS.


CLASS zcl_vendor_aging IMPLEMENTATION.

  METHOD run.

    DATA(lv_key_date) = COND sy-datum(
                          WHEN iv_key_date IS INITIAL
                          THEN sy-datum
                          ELSE iv_key_date ).

    "-- Read open vendor items via released CDS view (F-01, F-02)
    et_items = select_open_items( iv_company_code ).

    "-- Apply ageing buckets (F-04: no WITH HEADER LINE, inline field-symbol)
    assign_buckets(
      EXPORTING iv_key_date = lv_key_date
      CHANGING  ct_items    = et_items ).

    "-- Write last-run log via ABAP SQL (F-03: no EXEC SQL)
    write_log( iv_company_code ).

    ev_subrc = 0.

  ENDMETHOD.


  METHOD select_open_items.

    "-- candidate: I_VendorOpenItem_VAgeing is the CDS entity defined in
    "--            I_VendorOpenItem_VAgeing.cds; its consumed views are
    "--            themselves candidates (see F-01, F-02).
    "-- CDS element names are listed explicitly; they match ty_item component
    "-- names exactly, so INTO CORRESPONDING FIELDS maps without AS aliases.
    SELECT
        CompanyCode,
        Supplier,
        AccountingDocument,
        AccountingDocumentItem,         "< candidate element name; verify on target
        NetDueDate,
        AmountInCompanyCodeCurrency,
        SupplierName
      FROM ZI_VendorOpenItem_VAgeing     "#EC CI_NOWHERE "< candidate view name
      WHERE CompanyCode = @iv_company_code
      INTO CORRESPONDING FIELDS OF TABLE @rt_items.

  ENDMETHOD.


  METHOD assign_buckets.

    "-- F-04: LOOP with field-symbol replaces LOOP AT <hdr_line> / MODIFY.
    LOOP AT ct_items ASSIGNING FIELD-SYMBOL(<ls_item>).

      DATA(lv_days) = iv_key_date - <ls_item>-NetDueDate.

      "-- Business rules (bucket thresholds): carried over from legacy lines 45–51.
      "-- Threshold constants make the values testable in isolation.
      IF lv_days <= c_threshold_30.
        <ls_item>-Bucket = c_bucket_0_30.
      ELSEIF lv_days <= c_threshold_60.
        <ls_item>-Bucket = c_bucket_31_60.
      ELSE.
        <ls_item>-Bucket = c_bucket_60p.
      ENDIF.

    ENDLOOP.

  ENDMETHOD.


  METHOD write_log.

    "-- F-03: ABAP SQL UPDATE replaces EXEC SQL … ENDEXEC.
    "--       ZFI_AGING_LOG is assumed to be a customer-owned Z-table.
    "--       If a RAP BO governs it, replace this with an EML MODIFY call.
    "--       candidate: table name ZFI_AGING_LOG must be verified as
    "--                  customer-owned (not SAP-delivered).
    UPDATE zfi_aging_log  "#EC CI_NOWHERE "< candidate table name
      SET last_run = @sy-datum
      WHERE bukrs  = @iv_company_code.

    "-- Ignore sy-subrc: a missing log row is non-fatal; the caller decides
    "-- whether to surface the outcome.

  ENDMETHOD.


  METHOD assign_buckets_for_test.
    "-- Delegates to the private assign_buckets; exists only for unit tests.
    assign_buckets(
      EXPORTING iv_key_date = iv_key_date
      CHANGING  ct_items    = ct_items ).
  ENDMETHOD.


  METHOD hand_off_to_treasury.

    "! !! INTEGRATION POINT – treasury hand-off !!
    "!
    "! This method is intentionally left as a stub.
    "! Replace the body below with the outbound call once the integration
    "! architecture is known (see finding F-05 and F-06).
    "!
    "! The it_items table contains the fully bucketed result set.
    "! A human must decide:
    "!   - Protocol (HTTP/REST, OData, event mesh, IDoc, …)
    "!   - Authentication / Communication Arrangement name
    "!   - Whether a flat file is still required by the treasury system
    "!     or whether an API endpoint can be used instead
    "!   - Whether CL_APJ_RT_API should schedule a follow-up job

    "-- Suppress unused-parameter warning; remove once implemented.
    ASSERT it_items IS NOT INITIAL OR it_items IS INITIAL.

    ev_subrc = 4.  "< 4 = not yet implemented; change to 0 after real implementation

  ENDMETHOD.

ENDCLASS.
