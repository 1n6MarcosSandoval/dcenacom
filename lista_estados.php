<?php

include 'functions.php';
include 'vars.php';

session_start();
if(@$_SESSION['login'] != "si")
{
header("Location:index.php");
exit();
}

require_once('FirePHPCore/FirePHP.class.php');
ob_start();
$firephp = FirePHP::getInstance(true);

include 'arriba.php';
?>

		<br/>
	
	<div id="contenido">
<?php

		if($_POST["BuscarEdo"]){
$RegistrosAMostrar=10;

			$ESTADO_Find = $_POST["BuscarEdo"];
			//echo $ESTADO_Find;


//estos valores los recibo por GET
if(isset($_GET['pag'])){
	$RegistrosAEmpezar=($_GET['pag']-1)*$RegistrosAMostrar;
	$PagAct=$_GET['pag'];
	$RegistrosAMostrarQuery=$RegistrosAMostrar+$RegistrosAEmpezar;
//caso contrario los iniciamos
}else{
	$RegistrosAEmpezar=0;
	$PagAct=1;
	$RegistrosAMostrarQuery=$RegistrosAMostrar;	
}


$conOracle=conexionORACLE($HOST, $PORT, $SID, $userName, $passkey);


/*$queryS="SELECT CR, ESTADO, MUNICIPIO, TIPOFENOMENO_ID, EFECTO_ADVERSO, FECHA, ID_USUARIO FROM (SELECT CR, ESTADO, MUNICIPIO, TIPOFENOMENO_ID, EFECTO_ADVERSO, FECHA, ID_USUARIO, ROWNUM r FROM (SELECT CR, ESTADO, MUNICIPIO, TIPOFENOMENO_ID, EFECTO_ADVERSO, TO_CHAR(FECHA_AVISO, 'YYYY/MM/DD hh24:mm:ss') AS FECHA, ID_USUARIO FROM CENACOM.REPORTES ORDER BY CR DESC) WHERE ROWNUM <= ".$RegistrosAMostrarQuery." ) WHERE r > ".$RegistrosAEmpezar." AND ESTADO=".$ESTADO_Find;*/


$queryS="SELECT CR, ESTADO, MUNICIPIO, TIPOFENOMENO_ID, EFECTO_ADVERSO, FECHA, ID_USUARIO FROM (SELECT CR, ESTADO, MUNICIPIO, TIPOFENOMENO_ID, EFECTO_ADVERSO, FECHA, ID_USUARIO, ROWNUM r FROM (SELECT CR, ESTADO, MUNICIPIO, TIPOFENOMENO_ID, EFECTO_ADVERSO, TO_CHAR(FECHA_AVISO, 'YYYY/MM/DD hh24:mm:ss') AS FECHA, ID_USUARIO FROM CENACOM.REPORTES ORDER BY CR DESC)) WHERE ESTADO=".$ESTADO_Find;
$stid = oci_parse($conOracle, $queryS);

if (!$stid) {
    $e = oci_error($conOracle);
    trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
}

// Perform the logic of the query
$r = oci_execute($stid);
if (!$r) {
    $e = oci_error($stid);
    trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
}

echo "<table border='1px' cellpadding='4px' width='760px'>";
	echo "<tr>";
	echo '<td bgcolor="#D8D8D8" width="5%"> <center>CR</center></td>';
	echo '<td bgcolor="#D8D8D8" width="25%"> <center>Lugar</center></td>';
	echo '<td bgcolor="#D8D8D8" width="20%"> <center>Fen&oacute;meno</center></td>';
	echo '<td bgcolor="#D8D8D8" width="10%"><center>Fecha en que se reporta</center></td>';
	echo '<td bgcolor="#D8D8D8" width="30%"> <center>Autor(es)</center></td>';
	echo '<td bgcolor="#D8D8D8" width="15%"> <center>Edici&oacute;n</center></td>';
	echo '<td bgcolor="#D8D8D8" width="20%"><center>Archivos</center></td>';
	echo '<td bgcolor="#D8D8D8" width="20%"><center>Reporte PDF</center></td>';
	echo '<td bgcolor="#D8D8D8" width="20%"><center>Reporte Word</center></td>';
	echo '</tr>';

	
/**CR de la lisa**/
while ($row = oci_fetch_array($stid, OCI_ASSOC+OCI_RETURN_NULLS)) {
	echo "<tr>";
	$tipoReporte=obtenerValorQuery($conOracle,'CENACOM', 'REPORTES', 'CR', $row["CR"], 'ID_TIPO_REPORTE');
	switch ($tipoReporte) {
		case 0:
			$tipoReporteL="&Uacute;nico";
			break;
		case 1:
			$tipoReporteL="Alcance";
			break;
		case 2:
			$tipoReporteL="Inicial";
			break;
		case 3:
			$tipoReporteL="Seguimiento";
			break;
		case 4:
			$tipoReporteL="Final";
			break;
		default:
			$tipoReporteL="NO";
			break;
	}
	
	//echo "<td> <a href=\"visual_download.php?cr=".$row["CR"]."\">".$row["CR"]."-".$tipoReporteL."</td>";
	echo "<td>".$row["CR"]."-".$tipoReporteL."</td>";

	/**Fin CR de la lisa**/

	/**Lugar**/
	if($row["ESTADO"]!=NULL){

		$datoE = recuperaCampo($conOracle, 'ANRO.LOCALIDADES', 'NOM_ENT',  $row["ESTADO"], 'ENTIDAD'); 
	}else{echo "<td></td>";}
	if($row["MUNICIPIO"]!=NULL){
		$query='SELECT NOM_MUN from ANRO.LOCALIDADES WHERE ENTIDAD = '.$row["ESTADO"].' AND MUN ='.$row["MUNICIPIO"].' GROUP BY NOM_MUN';
		$datoM = queryRecuperaCampo($conOracle, $query);
	}else{echo "<td></td>";}
	echo "<td> ".$datoM.", ".$datoE."</td>";
	/**Fin Lugar**/
	
	/**Fenomeno**/
	if($row["TIPOFENOMENO_ID"]!=NULL){
		$myArray = explode(',', $row["TIPOFENOMENO_ID"]);
		$datoF = '';
		$i=0;
		for ($i = 0; $i < (sizeof($myArray)-1); $i++)
			$datoF = $datoF . recuperaCampo($conOracle, 'CENACOM.TIPO_FENOMENO', 'NOMBRE', $myArray[$i], 'ID_FENOMENO'). ', '; 
		$datoF = $datoF . recuperaCampo($conOracle, 'CENACOM.TIPO_FENOMENO', 'NOMBRE', $myArray[$i], 'ID_FENOMENO'); 
	}else{echo "<td></td>";}
	echo "<td>".$datoF."</td>";
	/**Fin Fenomeno**/
	
	//fecha
	echo "<td>".$row["FECHA"]."</td>";
	
	
	/**Autor**/
	echo "<td>".$row["ID_USUARIO"]."</td>";

	
	/**Edicion**/
	//$tipoReporte=obtenerValorQuery($conOracle,'CENACOM', 'REPORTES', 'CR', $row["CR"], 'ID_TIPO_REPORTE');	
	$firephp->log("Tipo reporte: ".$tipoReporte);
	switch ($tipoReporte) {
		case 0:
			$tipoReporteL="UNICO";
			echo "<td>"."EDITABLE"."</td>";
			//echo "<td>".'<a href="#" onclick="escribeLinkAlReporteE('.$row["CR"].',\''.$tipoReporteL.'\')"> Editar </a>'."</td>";			
			break;
		case 1:
			$tipoReporteL="ALCANCE";
			echo "<td>"."EDITABLE"."</td>";
			//echo "<td>".'<a href="#" onclick="escribeLinkAlReporteE('.$row["CR"].',\''.$tipoReporteL.'\')"> Editar </a>'."</td>";
			break;
		case 2:
			$tipoReporteL="INICIAL";
			echo "<td>"."EDITABLE"."</td>";
			//echo "<td>".'<a href="#" onclick="escribeLinkAlReporteE('.$row["CR"].',\''.$tipoReporteL.'\')"> Editar </a>'."</td>";
			break;
		case 3:
			$tipoReporteL="SEGUIMIENTO";
			echo "<td>"."EDITABLE"."</td>";
			//echo "<td>".'<a href="#" onclick="escribeLinkAlReporteE('.$row["CR"].',\''.$tipoReporteL.'\')"> Editar </a>'."</td>";
			break;
		case 4:
			$tipoReporteL="FINAL";
			echo "<td>"."EDITABLE"."</td>";
			//echo "<td>".'<a href="#" onclick="escribeLinkAlReporteE('.$row["CR"].',\''.$tipoReporteL.'\')"> Editar </a>'."</td>";
			break;
		default:
			echo "<td>"."NO EDITABLE"."</td>";
			break;
	}
	/**Fin Edicion**/
	
	/**Archivos**/

	echo "<td>
			<form method='post' id='VisualizarArchivos' name='VisualizarArchivos' action='VisualizarArchivos.php'>
				<input type = 'hidden' name = 'CR' id = 'CR' value = '".$row["CR"]."'>
				<input type='submit' value='Archivos' name='Archivos'>
			</form>
		</td>";
	/**Fin Archivos**/

	/**Archivos PDF**/
		$servidor = "";
		$sevidor = "/dcenacom/";
	echo "<td><a href='".$servidor."GenerarPDF.php"."?CR=".$row["CR"]."' target='_blank'>Archivo PDF</a>
		</td>";
	/**Fin Archivos PDF**/
	
		/**Archivos Word**/
	
	echo "<td><a href='".$servidor."DocumentosWord/plantillaWord.php"."?CR=".$row["CR"]."' target='_blank'>Archivo Word</a>
		</td>";
	/**Fin Archivos WORD**/
	
	echo "</tr>";
}
echo "</table>";
//******--------determinar las p?ginas---------******//
$query = oci_parse($conOracle, 'SELECT COUNT(*) AS VALOR FROM CENACOM.REPORTES');
oci_execute($query);
$row = oci_fetch_array($query, OCI_ASSOC);
$NroRegistros =$row["VALOR"];


$PagAnt=$PagAct-1;
$PagSig=$PagAct+1;
$PagUlt=$NroRegistros/$RegistrosAMostrar;

//verificamos residuo para ver si llevar decimales
$Res=$NroRegistros%$RegistrosAMostrar;
// si hay residuo usamos funcion floor para que me
// devuelva la parte entera, SIN REDONDEAR, y le sumamos
// una unidad para obtener la ultima pagina
if($Res>0) $PagUlt=floor($PagUlt)+1;

//desplazamiento
/*echo '<br/>';
echo '<center><div style="margin:auto;width:700px;">';
echo "<a onclick=\"Pagina('1','lista_estados.php')\">Primero </a> ";
if($PagAct>1) echo "<a onclick=\"Pagina('$PagAnt','lista_estados.php')\">Anterior </a> ";
echo "<strong>.: Pagina ".$PagAct."/".$PagUlt." :.</strong>";
if($PagAct<$PagUlt)  echo " <a onclick=\"Pagina('$PagSig','lista_estados.php')\">Siguiente </a> ";
echo "<a onclick=\"Pagina('$PagUlt','lista_estados.php')\"> Ultimo</a>";
echo '</div> </center>';*/

		}else{
			echo "<a href = 'buscador.php'>Regresar a la pagina anterior</a> ya que no ha ingresado datos";

		}


	cerrarConexionORACLE($conOracle);
?>
	</div>
</div>


		<div class="footer">
			<p>Sistema Nacional de Protecci&oacute;n Civil</p>
		</div>

</body>
</html>