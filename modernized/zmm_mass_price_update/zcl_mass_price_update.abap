*&---------------------------------------------------------------------*
*& Modernized artefact : zcl_mass_price_update
*& Origin              : ZMM_MASS_PRICE_UPDATE
*&                       (samples/legacy/zmm_mass_price_update.abap)
*& Sub-agent           : zmm_mass_price_update_agent
*& Verification status : Needs target verification
*&
*& Findings addressed
*&   F-01 CC-08  POPUP_TO_CONFIRM removed → confirm_stub
*&   F-02 CC-01  SELECT on MBEW → SELECT on CDS view I_MaterialValuation
*&   F-03 CC-03  UPDATE mbew removed → update_price_stub
*&   F-04 CC-04  CALL TRANSACTION MM02 / BDC removed → update_price_stub
*&   F-05 CC-09  WRITE list output removed → display_result_stub
*&   F-06 CC-11  FORM subroutines removed (logic inlined / stubbed)
*&   F-07 CC-10  TYPE mbew / TYPE c replaced by local CDS-aligned types
*&   F-08 Unclassified  Price-control guard added (VPRSV = 'S' only)
*&---------------------------------------------------------------------*
CLASS zcl_mass_price_update DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC
  FRIENDS zcl_mass_price_update_test.

  PUBLIC SECTION.

    " ----------------------------------------------------------------
    " Types — CamelCase component names match CDS element names exactly
    " so that SELECT … INTO CORRESPONDING FIELDS resolves without AS.
    " ----------------------------------------------------------------
    TYPES:
      BEGIN OF ty_valuation,
        Plant         TYPE werks_d,                          " maps to BWKEY
        Material      TYPE matnr_d,       /* candidate */   " verify TYPE matnr_d is released
        StandardPrice TYPE p LENGTH 11 DECIMALS 2, /* candidate */ " maps to STPRS
        PriceControl  TYPE char1,         /* candidate */   " maps to VPRSV
      END OF ty_valuation,
      ty_valuations TYPE STANDARD TABLE OF ty_valuation WITH EMPTY KEY.

    TYPES:
      BEGIN OF ty_result,
        Material  TYPE matnr_d,           /* candidate */
        OldPrice  TYPE p LENGTH 11 DECIMALS 2,
        NewPrice  TYPE p LENGTH 11 DECIMALS 2,
        Updated   TYPE abap_bool,
      END OF ty_result,
      ty_results TYPE STANDARD TABLE OF ty_result WITH EMPTY KEY.

    " ----------------------------------------------------------------
    " run – main entry point
    " ----------------------------------------------------------------
    METHODS run
      IMPORTING
        iv_plant    TYPE werks_d
        iv_pct      TYPE p LENGTH 5 DECIMALS 2
      RETURNING
        VALUE(rt_results) TYPE ty_results.

    " ----------------------------------------------------------------
    " confirm_stub  (replaces F-01: POPUP_TO_CONFIRM)
    "
    " STUB: Replace with a Fiori Elements action confirmation step or
    " remove entirely for background-job use.
    " Returns abap_true unconditionally until a real mechanism is
    " implemented.
    " ----------------------------------------------------------------
    METHODS confirm_stub
      RETURNING
        VALUE(rv_confirmed) TYPE abap_bool.

    " ----------------------------------------------------------------
    " update_price_stub  (replaces F-03: UPDATE mbew  AND
    "                              F-04: CALL TRANSACTION MM02 / BDC)
    "
    " STUB: Replace with a released RAP BO EML MODIFY statement OR
    " BAPI_MATERIAL_SAVEDATA — both are candidates; verify release
    " status on the target system.
    " Both the direct-table path (UPDATE mbew) and the BDC path
    " (CALL TRANSACTION MM02) have been removed and must NOT be
    " reintroduced in ABAP Cloud code.
    " ev_subrc = 0 means success; any other value signals a failure
    " that the caller must handle.
    " ----------------------------------------------------------------
    METHODS update_price_stub
      IMPORTING
        iv_material  TYPE matnr_d      /* candidate */
        iv_plant     TYPE werks_d
        iv_new_price TYPE p LENGTH 11 DECIMALS 2
      EXPORTING
        ev_subrc     TYPE sysubrc.

    " ----------------------------------------------------------------
    " display_result_stub  (replaces F-05: WRITE list output)
    "
    " STUB: Replace with ALV Grid / Fiori Elements result display or
    " write to an application log.
    " No WRITE / ULINE / SKIP statements are used in ABAP Cloud code.
    " ----------------------------------------------------------------
    METHODS display_result_stub
      IMPORTING
        it_results TYPE ty_results
      EXPORTING
        ev_subrc   TYPE sysubrc.

    " ----------------------------------------------------------------
    " test_friend_compute_new_price
    " Exposes the price-calculation formula to unit tests
    " (test-friend pattern – only callable from zcl_mass_price_update_test).
    " Formula (from legacy line 34):
    "   new_price = old_price * ( 1 + pct / 100 )
    " ----------------------------------------------------------------
    METHODS test_friend_compute_new_price
      IMPORTING
        iv_old_price      TYPE p LENGTH 11 DECIMALS 2
        iv_pct            TYPE p LENGTH 5 DECIMALS 2
      RETURNING
        VALUE(rv_new_price) TYPE p LENGTH 11 DECIMALS 2.

    " ----------------------------------------------------------------
    " test_friend_needs_price_control_guard
    " Returns abap_true when the material must be SKIPPED (price
    " control is NOT 'S').  Unit tests verify the guard logic.
    " ----------------------------------------------------------------
    METHODS test_friend_needs_price_control_guard
      IMPORTING
        iv_price_control  TYPE char1   /* candidate */
      RETURNING
        VALUE(rv_skip)    TYPE abap_bool.

  PRIVATE SECTION.

    " ----------------------------------------------------------------
    " select_materials
    " Reads material valuation data from the candidate CDS view.
    " Adjust the view name once the correct released entity is confirmed.
    " ----------------------------------------------------------------
    METHODS select_materials
      IMPORTING
        iv_plant          TYPE werks_d
      RETURNING
        VALUE(rt_mats)    TYPE ty_valuations.

ENDCLASS.


CLASS zcl_mass_price_update IMPLEMENTATION.

  METHOD run.

    " Step 1: confirmation gate (stub — always confirmed until replaced)
    IF confirm_stub( ) = abap_false.
      RETURN.
    ENDIF.

    " Step 2: read material valuation data
    DATA(lt_mats) = select_materials( iv_plant ).

    " Step 3: compute new prices, apply guard, call update stub
    LOOP AT lt_mats INTO DATA(ls_mat).

      " F-08: Price-control guard — skip materials not under standard
      " price control.  VPRSV = 'S' means standard price; 'V' means
      " moving-average price.  Only 'S' materials may have STPRS updated.
      IF test_friend_needs_price_control_guard( ls_mat-PriceControl ) = abap_true.
        CONTINUE.
      ENDIF.

      DATA(lv_new_price) = test_friend_compute_new_price(
                             iv_old_price = ls_mat-StandardPrice
                             iv_pct       = iv_pct ).

      DATA(ls_result) = VALUE ty_result(
        Material = ls_mat-Material
        OldPrice = ls_mat-StandardPrice
        NewPrice = lv_new_price
        Updated  = abap_false ).

      DATA(lv_subrc) = CONV sysubrc( 0 ).
      update_price_stub(
        EXPORTING
          iv_material  = ls_mat-Material
          iv_plant     = ls_mat-Plant
          iv_new_price = lv_new_price
        IMPORTING
          ev_subrc     = lv_subrc ).

      IF lv_subrc = 0.
        ls_result-Updated = abap_true.
      ENDIF.

      APPEND ls_result TO rt_results.

    ENDLOOP.

    " Step 4: surface results (stub — replace with ALV / app-log output)
    DATA(lv_display_subrc) = CONV sysubrc( 0 ).
    display_result_stub(
      EXPORTING it_results = rt_results
      IMPORTING ev_subrc   = lv_display_subrc ).

  ENDMETHOD.


  METHOD confirm_stub.
    " ----------------------------------------------------------------
    " STUB (F-01): POPUP_TO_CONFIRM removed.
    " Replace with a Fiori Elements action confirmation step or remove
    " for background-job use.
    " Returns abap_true unconditionally until implemented.
    " ----------------------------------------------------------------
    rv_confirmed = abap_true.
  ENDMETHOD.


  METHOD update_price_stub.
    " ----------------------------------------------------------------
    " STUB (F-03, F-04): Direct UPDATE mbew and CALL TRANSACTION MM02
    " have been removed.
    "
    " Replace this stub body with one of:
    "   a) EML:  MODIFY ENTITY <RAP_BO_NAME> /* candidate */
    "              UPDATE FIELDS ( StandardPrice )
    "              WITH VALUE #( ( %key-Plant    = iv_plant
    "                               %key-Material = iv_material
    "                               StandardPrice = iv_new_price ) ).
    "
    "   b) BAPI: CALL FUNCTION 'BAPI_MATERIAL_SAVEDATA' /* candidate */
    "              EXPORTING headdata  = ...
    "              TABLES    costing   = ...
    "            CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'.
    "
    " Verify release status of both options on the target system before
    " use.  Only a released API creates the necessary CO/costing document
    " (MR21 equivalent).
    " ----------------------------------------------------------------
    ev_subrc = 4. " signal not-yet-implemented so callers can log/skip
  ENDMETHOD.


  METHOD display_result_stub.
    " ----------------------------------------------------------------
    " STUB (F-05): WRITE / ULINE / SKIP list output removed.
    " Replace with:
    "   – ALV Grid (CL_SALV_TABLE) for interactive use, or
    "   – Application Log (BAPI_XM_LOG* / CL_BALI_LOG) for batch, or
    "   – Fiori Elements table display.
    " ----------------------------------------------------------------
    ev_subrc = 0.
  ENDMETHOD.


  METHOD test_friend_compute_new_price.
    " Price formula preserved from legacy line 34:
    "   ls_mbew-stprs = ls_mbew-stprs * ( 1 + p_pct / 100 )
    rv_new_price = iv_old_price * ( 1 + iv_pct / 100 ).
  ENDMETHOD.


  METHOD test_friend_needs_price_control_guard.
    " F-08: guard that was MISSING in the legacy program.
    " Skip (rv_skip = abap_true) for any price control that is NOT 'S'.
    IF iv_price_control = 'S'.
      rv_skip = abap_false.
    ELSE.
      rv_skip = abap_true.
    ENDIF.
  ENDMETHOD.


  METHOD select_materials.
    " ----------------------------------------------------------------
    " Reads from the candidate CDS view I_MaterialValuation.
    " Adjust the view name once the correct released entity is confirmed.
    " No direct SELECT on MBEW (F-02, F-07).
    " ----------------------------------------------------------------
    SELECT Plant,
           Material,
           StandardPrice,  /* candidate */
           PriceControl    /* candidate */
      FROM I_MaterialValuation  /* candidate: verify view name and fields */
      WHERE Plant = @iv_plant
      INTO CORRESPONDING FIELDS OF TABLE @rt_mats.
  ENDMETHOD.

ENDCLASS.
