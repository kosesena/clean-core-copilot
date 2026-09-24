" Synthetic classic ABAP analysis fixture. Not compiled or executed.
" Legacy report sample.
REPORT zcc_legacy_materials.

TABLES mara.
SELECT-OPTIONS s_matnr FOR mara-matnr.

TYPES: BEGIN OF ty_material,
         matnr TYPE mara-matnr,
         mtart TYPE mara-mtart,
       END OF ty_material.
DATA lt_materials TYPE STANDARD TABLE OF ty_material.

START-OF-SELECTION.
  SELECT matnr mtart
    FROM mara
    INTO TABLE lt_materials
    WHERE matnr IN s_matnr.

  IF lt_materials IS INITIAL.
    WRITE: / 'No materials found'.
    RETURN.
  ENDIF.

  CALL FUNCTION 'REUSE_ALV_GRID_DISPLAY'
    EXPORTING
      i_structure_name = 'MARA'
    TABLES
      t_outtab          = lt_materials
    EXCEPTIONS
      program_error    = 1
      OTHERS           = 2.
  IF sy-subrc <> 0.
    WRITE: / 'Display failed'.
  ENDIF.
