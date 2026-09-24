*&---------------------------------------------------------------------*
*& Report ZMM_MASS_PRICE_UPDATE
*&---------------------------------------------------------------------*
*& Raises the standard price of all materials in a plant by a
*& percentage. Used once a year by the costing team.
*& Synthetic sample for the Clean Core Copilot demo.
*&---------------------------------------------------------------------*
REPORT zmm_mass_price_update.

DATA: lt_mbew   TYPE TABLE OF mbew,
      ls_mbew   TYPE mbew,
      lt_bdc    TYPE TABLE OF bdcdata,
      ls_bdc    TYPE bdcdata,
      lv_answer TYPE c.

PARAMETERS: p_werks TYPE werks_d OBLIGATORY,
            p_pct   TYPE p DECIMALS 2 OBLIGATORY,
            p_bdc   AS CHECKBOX.

START-OF-SELECTION.

  CALL FUNCTION 'POPUP_TO_CONFIRM'
    EXPORTING
      text_question = 'Really update all prices?'
    IMPORTING
      answer        = lv_answer.
  CHECK lv_answer = '1'.

  SELECT * FROM mbew INTO TABLE lt_mbew WHERE bwkey = p_werks.

  IF p_bdc IS INITIAL.
*   Fast path: write the standard table directly
    LOOP AT lt_mbew INTO ls_mbew.
      ls_mbew-stprs = ls_mbew-stprs * ( 1 + p_pct / 100 ).
      UPDATE mbew FROM ls_mbew.
    ENDLOOP.
    COMMIT WORK.
  ELSE.
*   "Safe" path: replay the MM02 screens
    LOOP AT lt_mbew INTO ls_mbew.
      CLEAR lt_bdc.
      PERFORM bdc_dynpro USING 'SAPLMGMM' '0060'.
      PERFORM bdc_field  USING 'RMMG1-MATNR' ls_mbew-matnr.
      PERFORM bdc_field  USING 'BDC_OKCODE' '/00'.
      CALL TRANSACTION 'MM02' USING lt_bdc MODE 'N' UPDATE 'S'.
    ENDLOOP.
  ENDIF.

  WRITE: / 'Updated', lines( lt_mbew ), 'materials.'.

FORM bdc_dynpro USING program dynpro.
  CLEAR ls_bdc.
  ls_bdc-program  = program.
  ls_bdc-dynpro   = dynpro.
  ls_bdc-dynbegin = 'X'.
  APPEND ls_bdc TO lt_bdc.
ENDFORM.

FORM bdc_field USING fnam fval.
  CLEAR ls_bdc.
  ls_bdc-fnam = fnam.
  ls_bdc-fval = fval.
  APPEND ls_bdc TO lt_bdc.
ENDFORM.
