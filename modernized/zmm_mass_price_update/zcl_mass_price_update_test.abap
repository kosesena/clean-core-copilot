*&---------------------------------------------------------------------*
*& Modernized artefact : zcl_mass_price_update_test
*& Origin              : ZMM_MASS_PRICE_UPDATE
*&                       (samples/legacy/zmm_mass_price_update.abap)
*& Sub-agent           : zmm_mass_price_update_agent
*& Verification status : Needs target verification
*&
*& ABAP Unit tests for zcl_mass_price_update.
*& Tests are isolated to pure business-logic methods exposed via the
*& test-friend pattern; no database access or stub calls are made.
*&---------------------------------------------------------------------*
CLASS zcl_mass_price_update_test DEFINITION
  FOR TESTING
  RISK LEVEL HARMLESS
  DURATION SHORT
  FINAL.

  PRIVATE SECTION.

    DATA mo_cut TYPE REF TO zcl_mass_price_update.  " class under test

    METHODS setup.

    " Price-formula tests (one per business rule variant)
    METHODS price_formula_10_pct   FOR TESTING.
    METHODS price_formula_0_pct    FOR TESTING.
    METHODS price_formula_50_pct   FOR TESTING.

    " Price-control guard tests
    METHODS guard_skips_vprsv_v    FOR TESTING.
    METHODS guard_allows_vprsv_s   FOR TESTING.
    METHODS guard_skips_vprsv_empty FOR TESTING.

ENDCLASS.


CLASS zcl_mass_price_update_test IMPLEMENTATION.

  METHOD setup.
    mo_cut = NEW zcl_mass_price_update( ).
  ENDMETHOD.


  " ------------------------------------------------------------------
  " Price-formula tests
  " Formula: new_price = old_price * ( 1 + pct / 100 )
  " ------------------------------------------------------------------

  METHOD price_formula_10_pct.
    " price=1000, pct=10 → new price must equal 1100
    DATA(lv_result) = mo_cut->test_friend_compute_new_price(
                        iv_old_price = CONV p( '1000.00' )
                        iv_pct       = CONV p( '10.00'  ) ).

    cl_abap_unit_assert=>assert_equals(
      exp = CONV p( '1100.00' )
      act = lv_result
      msg = 'price_formula_10_pct: expected 1100.00' ).
  ENDMETHOD.


  METHOD price_formula_0_pct.
    " pct=0 → price must be unchanged
    DATA(lv_result) = mo_cut->test_friend_compute_new_price(
                        iv_old_price = CONV p( '500.00' )
                        iv_pct       = CONV p( '0.00'   ) ).

    cl_abap_unit_assert=>assert_equals(
      exp = CONV p( '500.00' )
      act = lv_result
      msg = 'price_formula_0_pct: expected price unchanged (500.00)' ).
  ENDMETHOD.


  METHOD price_formula_50_pct.
    " price=200, pct=50 → new price must equal 300
    DATA(lv_result) = mo_cut->test_friend_compute_new_price(
                        iv_old_price = CONV p( '200.00' )
                        iv_pct       = CONV p( '50.00'  ) ).

    cl_abap_unit_assert=>assert_equals(
      exp = CONV p( '300.00' )
      act = lv_result
      msg = 'price_formula_50_pct: expected 300.00' ).
  ENDMETHOD.


  " ------------------------------------------------------------------
  " Price-control guard tests  (F-08)
  " guard returns abap_true  → material must be SKIPPED
  " guard returns abap_false → material is eligible for update
  " ------------------------------------------------------------------

  METHOD guard_skips_vprsv_v.
    " PriceControl = 'V' (moving-average price) → must be skipped
    DATA(lv_skip) = mo_cut->test_friend_needs_price_control_guard(
                      iv_price_control = 'V' ).

    cl_abap_unit_assert=>assert_true(
      act = lv_skip
      msg = 'guard_skips_vprsv_v: VPRSV=V must trigger skip (rv_skip=true)' ).
  ENDMETHOD.


  METHOD guard_allows_vprsv_s.
    " PriceControl = 'S' (standard price) → must NOT be skipped
    DATA(lv_skip) = mo_cut->test_friend_needs_price_control_guard(
                      iv_price_control = 'S' ).

    cl_abap_unit_assert=>assert_false(
      act = lv_skip
      msg = 'guard_allows_vprsv_s: VPRSV=S must NOT trigger skip (rv_skip=false)' ).
  ENDMETHOD.


  METHOD guard_skips_vprsv_empty.
    " PriceControl = '' (empty / unknown) → must be skipped
    " Empty means the price-control field is not set; treat as non-standard.
    DATA(lv_skip) = mo_cut->test_friend_needs_price_control_guard(
                      iv_price_control = '' ).

    cl_abap_unit_assert=>assert_true(
      act = lv_skip
      msg = 'guard_skips_vprsv_empty: empty VPRSV must trigger skip (rv_skip=true)' ).
  ENDMETHOD.

ENDCLASS.
