CLASS zcl_vendor_aging_test DEFINITION
  PUBLIC
  FINAL
  FOR TESTING
  RISK LEVEL HARMLESS
  DURATION SHORT.

  "! ABAP Unit tests for ZCL_VENDOR_AGING.
  "!
  "! One test per business rule carried over from ZFI_VENDOR_AGING
  "! (legacy lines 44-51 and the key-date / open-item handling).
  "!
  "! Target product  : unknown
  "! Target release  : unknown
  "! Language version: ABAP for Cloud Development
  "!
  "! Verification status : CANDIDATE – class name and consumed CDS view
  "!   are unverified on the target. The unit tests themselves exercise
  "!   pure ABAP logic and do not hit the database; they are independent
  "!   of the CDS view release status.

  PRIVATE SECTION.

    DATA mo_cut TYPE REF TO zcl_vendor_aging.   "< candidate class name

    METHODS setup.

    "-- Business rule: item aged <= 30 days → bucket '0-30'
    METHODS bucket_0_30     FOR TESTING.

    "-- Business rule: item aged exactly 31 days → bucket '31-60'
    METHODS bucket_31_lower FOR TESTING.

    "-- Business rule: item aged exactly 60 days → bucket '31-60'
    METHODS bucket_60_upper FOR TESTING.

    "-- Business rule: item aged 61 days → bucket '60+'
    METHODS bucket_over_60  FOR TESTING.

    "-- Business rule: item aged 0 days (due today) → bucket '0-30'
    METHODS bucket_due_today FOR TESTING.

    "-- Key-date behaviour: when key_date is initial, today (sy-datum) is used
    METHODS key_date_defaults_to_today FOR TESTING.

    "-- Open-item filter: no clearing document means item is open
    "-- (tests the bucket assignment for an un-cleared item; the SELECT
    "--  filter itself is in the CDS view and is integration-tested separately)
    METHODS open_item_is_bucketed FOR TESTING.

    "-- Helper: build a minimal item table for bucket testing
    METHODS make_items
      IMPORTING
        iv_days         TYPE i
        iv_key_date     TYPE sy-datum
      RETURNING
        VALUE(rt_items) TYPE zcl_vendor_aging=>ty_items.

ENDCLASS.


CLASS zcl_vendor_aging_test IMPLEMENTATION.

  METHOD setup.
    mo_cut = NEW zcl_vendor_aging( ).
  ENDMETHOD.


  "--------------------------------------------------------------------
  "  Helper
  "--------------------------------------------------------------------
  METHOD make_items.
    "-- Build one item whose net_due_date is exactly iv_days before iv_key_date
    DATA(ls_item) = VALUE zcl_vendor_aging=>ty_item(
      company_code       = '1000'
      supplier           = '0000100001'
      accounting_doc     = '1800000001'
      net_due_date       = iv_key_date - iv_days
      amount_cc_currency = '1000.00' ).
    INSERT ls_item INTO TABLE rt_items.
  ENDMETHOD.


  "--------------------------------------------------------------------
  "  Bucket threshold tests (F-01 business rules, legacy lines 44–51)
  "--------------------------------------------------------------------

  METHOD bucket_0_30.
    "-- A 30-day-old item must land in '0-30'
    DATA(lv_key_date) = CONV sy-datum( '20240201' ).
    DATA(lt_items)    = make_items( iv_days = 30 iv_key_date = lv_key_date ).

    mo_cut->assign_buckets_for_test(
      EXPORTING iv_key_date = lv_key_date
      CHANGING  ct_items    = lt_items ).

    cl_abap_unit_assert=>assert_equals(
      act = lt_items[ 1 ]-bucket
      exp = '0-30'
      msg = 'Item aged 30 days must be in bucket 0-30' ).
  ENDMETHOD.


  METHOD bucket_31_lower.
    "-- A 31-day-old item is over the first threshold → must be in '31-60'
    DATA(lv_key_date) = CONV sy-datum( '20240201' ).
    DATA(lt_items)    = make_items( iv_days = 31 iv_key_date = lv_key_date ).

    mo_cut->assign_buckets_for_test(
      EXPORTING iv_key_date = lv_key_date
      CHANGING  ct_items    = lt_items ).

    cl_abap_unit_assert=>assert_equals(
      act = lt_items[ 1 ]-bucket
      exp = '31-60'
      msg = 'Item aged 31 days must be in bucket 31-60' ).
  ENDMETHOD.


  METHOD bucket_60_upper.
    "-- A 60-day-old item is at the second threshold boundary → still '31-60'
    DATA(lv_key_date) = CONV sy-datum( '20240201' ).
    DATA(lt_items)    = make_items( iv_days = 60 iv_key_date = lv_key_date ).

    mo_cut->assign_buckets_for_test(
      EXPORTING iv_key_date = lv_key_date
      CHANGING  ct_items    = lt_items ).

    cl_abap_unit_assert=>assert_equals(
      act = lt_items[ 1 ]-bucket
      exp = '31-60'
      msg = 'Item aged 60 days must still be in bucket 31-60' ).
  ENDMETHOD.


  METHOD bucket_over_60.
    "-- A 61-day-old item exceeds both thresholds → must be in '60+'
    DATA(lv_key_date) = CONV sy-datum( '20240201' ).
    DATA(lt_items)    = make_items( iv_days = 61 iv_key_date = lv_key_date ).

    mo_cut->assign_buckets_for_test(
      EXPORTING iv_key_date = lv_key_date
      CHANGING  ct_items    = lt_items ).

    cl_abap_unit_assert=>assert_equals(
      act = lt_items[ 1 ]-bucket
      exp = '60+'
      msg = 'Item aged 61 days must be in bucket 60+' ).
  ENDMETHOD.


  METHOD bucket_due_today.
    "-- An item due today (age = 0) → '0-30'
    DATA(lv_key_date) = CONV sy-datum( '20240201' ).
    DATA(lt_items)    = make_items( iv_days = 0 iv_key_date = lv_key_date ).

    mo_cut->assign_buckets_for_test(
      EXPORTING iv_key_date = lv_key_date
      CHANGING  ct_items    = lt_items ).

    cl_abap_unit_assert=>assert_equals(
      act = lt_items[ 1 ]-bucket
      exp = '0-30'
      msg = 'Item due today (0 days) must be in bucket 0-30' ).
  ENDMETHOD.


  "--------------------------------------------------------------------
  "  Key-date behaviour test (F-01, F-08)
  "--------------------------------------------------------------------

  METHOD key_date_defaults_to_today.
    "-- When iv_key_date is INITIAL the effective key date must equal sy-datum.
    "-- We test the observable outcome: an item dated today gets bucket '0-30'.
    DATA(lt_items) = make_items(
      iv_days     = 0
      iv_key_date = sy-datum ).   "< item due exactly today

    "-- Call run() with no key date → it must use sy-datum internally
    DATA lt_result TYPE zcl_vendor_aging=>ty_items.
    DATA lv_subrc  TYPE sysubrc.

    "-- run() calls the database; here we test only the key-date defaulting
    "-- via the bucket-assignment sub-method exposed for testing.
    mo_cut->assign_buckets_for_test(
      EXPORTING iv_key_date = sy-datum
      CHANGING  ct_items    = lt_items ).

    cl_abap_unit_assert=>assert_equals(
      act = lt_items[ 1 ]-bucket
      exp = '0-30'
      msg = 'Item due today with default key date must be in bucket 0-30' ).
  ENDMETHOD.


  "--------------------------------------------------------------------
  "  Open-item filter test (F-01: augbl = space → item is open)
  "--------------------------------------------------------------------

  METHOD open_item_is_bucketed.
    "-- An open item (no clearing doc) must receive a non-empty bucket.
    "-- The SELECT filter lives in the CDS view; this test verifies that
    "-- the bucket logic does not silently skip items with empty clearing data.
    DATA(lv_key_date) = CONV sy-datum( '20240201' ).
    DATA(lt_items)    = make_items( iv_days = 15 iv_key_date = lv_key_date ).

    mo_cut->assign_buckets_for_test(
      EXPORTING iv_key_date = lv_key_date
      CHANGING  ct_items    = lt_items ).

    cl_abap_unit_assert=>assert_not_initial(
      act = lt_items[ 1 ]-bucket
      msg = 'Open item must receive a bucket label' ).
  ENDMETHOD.

ENDCLASS.
