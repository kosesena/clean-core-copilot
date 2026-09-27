"! ---------------------------------------------------------------------
"! ADDED BY THE PROJECT TEAM (Sena / Claude), 27 Sep 2026 — NOT Bob output.
"! Differential test: the legacy ageing rule (ZFI_VENDOR_AGING lines 44–51)
"! is ported verbatim as an oracle and compared with Bob's class for every
"! age from 30 days before due to 400 days overdue (431 cases).
"! Paste the two METHODS declarations into the DEFINITION of
"! ltc_vendor_aging (PRIVATE SECTION), and the two METHOD bodies into its
"! IMPLEMENTATION. Everything else in the include stays as Bob wrote it.
"! ---------------------------------------------------------------------

"---- add to DEFINITION (private section) ----
    METHODS legacy_rule_equivalence FOR TESTING.
    METHODS legacy_bucket
      IMPORTING iv_days          TYPE i
      RETURNING VALUE(rv_bucket) TYPE zcl_vendor_aging=>ty_item-Bucket.

"---- add to IMPLEMENTATION ----
  METHOD legacy_bucket.
    "-- Oracle: verbatim port of the legacy report, lines 45–51. Not Bob's code.
    IF iv_days <= 30.
      rv_bucket = '0-30'.
    ELSEIF iv_days <= 60.
      rv_bucket = '31-60'.
    ELSE.
      rv_bucket = '60+'.
    ENDIF.
  ENDMETHOD.

  METHOD legacy_rule_equivalence.
    "-- Same input, old rule vs. new code, for 431 ages in a row.
    DATA(lv_key_date) = CONV sy-datum( '20240201' ).
    DATA lv_days TYPE i VALUE -30.
    WHILE lv_days <= 400.
      DATA(lt_items) = make_items( iv_days = lv_days iv_key_date = lv_key_date ).
      mo_cut->assign_buckets_for_test(
        EXPORTING iv_key_date = lv_key_date
        CHANGING  ct_items    = lt_items ).
      cl_abap_unit_assert=>assert_equals(
        act = lt_items[ 1 ]-Bucket
        exp = legacy_bucket( lv_days )
        msg = |Age { lv_days } days: new code disagrees with the legacy rule| ).
      lv_days = lv_days + 1.
    ENDWHILE.
  ENDMETHOD.
