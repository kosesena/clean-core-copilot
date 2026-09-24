*&---------------------------------------------------------------------*
*& Report ZFI_VENDOR_AGING
*&---------------------------------------------------------------------*
*& Vendor open items bucketed by age, written to a file on the
*& application server for a nightly pickup by the treasury system.
*& Synthetic sample for the Clean Core Copilot demo.
*&---------------------------------------------------------------------*
REPORT zfi_vendor_aging.

TYPES: BEGIN OF ty_item,
         lifnr TYPE lifnr,
         name1 TYPE name1_gp,
         belnr TYPE belnr_d,
         zfbdt TYPE dzfbdt,
         dmbtr TYPE dmbtr,
         bucket TYPE char10,
       END OF ty_item.

DATA: gt_items TYPE STANDARD TABLE OF ty_item WITH HEADER LINE,
      gv_file  TYPE string VALUE '/usr/sap/trans/out/aging.csv',
      gv_line  TYPE string,
      gv_days  TYPE i.

PARAMETERS: p_bukrs TYPE bukrs OBLIGATORY,
            p_keydt TYPE sy-datum DEFAULT sy-datum.

START-OF-SELECTION.

* Open vendor items: read the line item table directly
  SELECT b~lifnr, l~name1, b~belnr, b~zfbdt, b~dmbtr
    FROM bseg AS b
    INNER JOIN lfa1 AS l ON l~lifnr = b~lifnr
    WHERE b~bukrs = @p_bukrs
      AND b~koart = 'K'
      AND b~augbl = @space
    INTO CORRESPONDING FIELDS OF TABLE @gt_items.

* Currency conversion done in the database, native, because "it was faster"
  EXEC SQL.
    UPDATE ZFI_AGING_LOG SET LAST_RUN = :sy-datum WHERE BUKRS = :p_bukrs
  ENDEXEC.

  LOOP AT gt_items.
    gv_days = p_keydt - gt_items-zfbdt.
    IF gv_days <= 30.
      gt_items-bucket = '0-30'.
    ELSEIF gv_days <= 60.
      gt_items-bucket = '31-60'.
    ELSE.
      gt_items-bucket = '60+'.
    ENDIF.
    MODIFY gt_items.
  ENDLOOP.

  OPEN DATASET gv_file FOR OUTPUT IN TEXT MODE ENCODING DEFAULT.
  IF sy-subrc <> 0.
    MESSAGE 'Cannot open file' TYPE 'E'.
  ENDIF.
  LOOP AT gt_items.
    CONCATENATE gt_items-lifnr gt_items-name1 gt_items-belnr
                gt_items-bucket INTO gv_line SEPARATED BY ';'.
    TRANSFER gv_line TO gv_file.
  ENDLOOP.
  CLOSE DATASET gv_file.

* Kick off the treasury upload job
  SUBMIT zfi_treasury_upload WITH p_file = gv_file AND RETURN.
