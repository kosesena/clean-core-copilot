*&---------------------------------------------------------------------*
*& Report ZSD_OPEN_ORDERS
*&---------------------------------------------------------------------*
*& Open sales orders per customer, printed as a classic list.
*& Written 2009, "extended" many times since. Synthetic sample for the
*& Clean Core Copilot demo - not taken from any real system.
*&---------------------------------------------------------------------*
REPORT zsd_open_orders LINE-SIZE 132 NO STANDARD PAGE HEADING.

TABLES: vbak, vbap, kna1.

DATA: BEGIN OF it_orders OCCURS 0,
        vbeln LIKE vbak-vbeln,
        erdat LIKE vbak-erdat,
        kunnr LIKE vbak-kunnr,
        name1 LIKE kna1-name1,
        posnr LIKE vbap-posnr,
        matnr LIKE vbap-matnr,
        kwmeng LIKE vbap-kwmeng,
        netwr LIKE vbap-netwr,
      END OF it_orders.

DATA: w_total LIKE vbap-netwr.

SELECT-OPTIONS: s_kunnr FOR vbak-kunnr,
                s_erdat FOR vbak-erdat.
PARAMETERS:     p_vkorg LIKE vbak-vkorg OBLIGATORY.

START-OF-SELECTION.
  PERFORM get_data.
  PERFORM print_list.

*&---------------------------------------------------------------------*
FORM get_data.
  SELECT * FROM vbak WHERE kunnr IN s_kunnr
                       AND erdat IN s_erdat
                       AND vkorg = p_vkorg.
    SELECT * FROM vbap WHERE vbeln = vbak-vbeln.
*     "open" = no delivery yet - status read straight from VBUP
      SELECT SINGLE * FROM vbup INTO @DATA(ls_vbup)
        WHERE vbeln = @vbap-vbeln AND posnr = @vbap-posnr.
      CHECK ls_vbup-lfsta <> 'C'.
      SELECT SINGLE name1 FROM kna1 INTO it_orders-name1
        WHERE kunnr = vbak-kunnr.
      MOVE-CORRESPONDING vbak TO it_orders.
      MOVE-CORRESPONDING vbap TO it_orders.
      APPEND it_orders.
    ENDSELECT.
  ENDSELECT.
ENDFORM.

*&---------------------------------------------------------------------*
FORM print_list.
  SORT it_orders BY kunnr vbeln posnr.
  LOOP AT it_orders.
    AT NEW kunnr.
      SKIP.
      WRITE: / it_orders-kunnr COLOR COL_HEADING, it_orders-name1.
      ULINE.
    ENDAT.
    WRITE: / it_orders-vbeln, it_orders-erdat, it_orders-posnr,
             it_orders-matnr, it_orders-kwmeng, it_orders-netwr.
    ADD it_orders-netwr TO w_total.
  ENDLOOP.
  ULINE.
  WRITE: / 'Total open value:', w_total.
ENDFORM.
