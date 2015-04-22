<?php
include 'functions.php';
include 'vars.php';
session_start();
if(@$_SESSION['login'] != "si" || @$_POST["crReal"]==NULL)
{
header("Location:index.php");
exit();
}
$conOracle=conexionORACLE($HOST, $PORT, $SID, $userName, $passkey);
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<!-- <meta http-equiv="content-type" content="text/html; charset=utf-8" /> -->
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
<title>Reportes relevantes</title>
<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/dojo/1.8/dijit/themes/claro/claro.css">
<link rel="stylesheet" href="images/style.css" type="text/css" />
<script src="//ajax.googleapis.com/ajax/libs/dojo/1.8.0/dojo/dojo.js" data-dojo-config='async: true, parseOnLoad: true'></script>
<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript" src="js/functions.js"></script>
<script type="text/javascript" src="js/validacionFinal.js"></script>
<script>
require(["dojo/parser", "dijit/form/DateTextBox"]);
</script>

</head>
<body class="claro">
	
	<?php
	include 'formsMenuHead.php';
	?>

	<?php
	$crReal=$_POST["crReal"];
	$idEvento=obtenerValorQuery($conOracle,'CENACOM', 'REPORTES', 'CR', $crReal, 'ID_EVENTO');
	?>		
	
<h1>Sistema de captura</h1>

		<!--IZQUIERDA -->
		<div class="left">
		
			<div class="lboxForm">
	<h2>Reporte de tipo Final a <?php echo $crReal; ?></h2>



<form method="post" id="ffinal" name="ffinal" action="ffinal.php">
	<input type="hidden" name="tipoReporte" id="tipoReporte" value="4">
	<input type="hidden" name="crRelacionado" id="crRelacionado" value="<?php echo $crReal; ?>">
	<input type="hidden" name="eventoRelacionado" id="eventoRelacionado" value="<?php echo $idEvento; ?>">
	<div id="finalEfectoAdversoLeyenda">Efecto adverso:</div>
	<textarea name="finalEfectoAdverso" id="finalEfectoAdverso" title="Efecto adverso" rows="3" cols="50" onKeyUp="alertNumCaracTextArea('finalEfectoAdverso', 4000);"></textarea>
	<br/>
	<br/>

	Organismo que reporta: 
<?php
	$query = oci_parse($conOracle, 'SELECT ID, NOMBRE from CENACOM.DEPENDENCIAS ORDER BY ID');
	comboQueryJS_1($query, "ID", "NOMBRE", 'finalOrganismoReporta', "Seleccione","Organismo que reporta");
?>
	<br/>
<?php
	fechaBox("Fecha en que reporta:", "finalFechaReporta", "finalFechaReporta", date('Y-m-d'), 'Fecha en que reporta');
?>
	<br/>
<?php
	hora("Hora que reporta:", "finalHoraQueReporta", "finalHoraQueReporta", 'Hora que reporta');
?>

<?php
	$finalEstado=obtenerValorQuery($conOracle,'CENACOM', 'REPORTES', 'CR', $crReal, 'ESTADO');
	$finalMunicipio=obtenerValorQuery($conOracle,'CENACOM', 'REPORTES', 'CR', $crReal, 'MUNICIPIO');
	$finalLocalidad=obtenerValorQuery($conOracle,'CENACOM', 'REPORTES', 'CR', $crReal, 'LOCALIDAD');
	$finalOtroLugar=obtenerValorQuery($conOracle,'CENACOM', 'REPORTES', 'CR', $crReal, 'OTRO_LUGAR');
	$finalClasificacionFenomeno=obtenerValorQuery($conOracle,'CENACOM', 'REPORTES', 'CR', $crReal, 'CLASIFICACIONFENOMENO_ID');
	$finalTipoFenomeno=obtenerValorQuery($conOracle,'CENACOM', 'REPORTES', 'CR', $crReal, 'TIPOFENOMENO_ID');
	$finalFechaFenomenoM=obtenerValorFecha($conOracle,'CENACOM', 'REPORTES', 'CR', $crReal, 'FECHA_INICIO_FENOMENO');
	$finalFechaFenomeno = substr($finalFechaFenomenoM, 0, 11);
	$finalHoraInicialFenomenoval = substr($finalFechaFenomenoM, 11, -3);
	
?>
	<br/>
	<input type="hidden" name="finalEstado" id="finalEstado" value="<?php echo $finalEstado; ?>">
	<input type="hidden" name="finalMunicipio" id="finalMunicipio" value="<?php echo $finalMunicipio; ?>">
	<input type="hidden" name="finalLocalidad" id="finalLocalidad" value="<?php echo $finalLocalidad; ?>">
	<input type="hidden" name="finalOtroLugar" id="finalOtroLugar" value="<?php echo $finalOtroLugar; ?>">
	<input type="hidden" name="finalClasificacionFenomeno" id="finalClasificacionFenomeno" value="<?php echo $finalClasificacionFenomeno; ?>">
	<input type="hidden" name="finalTipoFenomeno" id="finalTipoFenomeno" value="<?php echo $finalTipoFenomeno; ?>">
	<input type="hidden" name="finalFechaFenomeno" id="finalFechaFenomeno" value="<?php echo $finalFechaFenomeno; ?>">
	<input type="hidden" name="finalHoraInicialFenomenoval" id="finalHoraInicialFenomenoval" value="<?php echo $finalHoraInicialFenomenoval; ?>">
	<br/>
<?php
	fechaBox("Fecha en que termina el fen&oacute;meno:", "finalFechaFinalFenomeno", "finalFechaFinalFenomeno", date('Y-m-d'), 'Fecha en que termina el fen&oatue;meno');
?>
	<br/>
<?php
	hora("Hora en que termina el fen&oacute;meno:", "finalHoraFinFenomeno", "finalHoraFinFenomeno", 'Hora en que termina el fen&oatue;meno');
?>
	<br/>	
	<div id="finalAreasAfectadasLeyenda">&Aacute;reas afectadas:</div>
	<textarea id="finalAreasAfectadas" name="finalAreasAfectadas" title="&Aacute;reas afectadas" rows="3" cols="50" onKeyUp="alertNumCaracTextArea('finalAreasAfectadas', 4000);"></textarea>	
	<br/>
	<br/>
	Personas afectadas:<br/>
	<input id="finalPersonasAfectadas" name="finalPersonasAfectadas" title="Personas afectadas" size="66" maxlength="999" type="text" value=""/>
	<br/>
	<br/>	
	Muertos: <input id="finalMuertos" name="finalMuertos" title="Muertos" maxlength="7" size="4" type="text" value="0"/>
	<br/>
	Lesionados: <input id="finalLesionados" name="finalLesionados" title="Lesionados" maxlength="7" size="4" type="text" value="0"/>
	<br/>
	Evacuados: <input id="finalEvacuados" name="finalEvacuados" title="Evacuados" maxlength="7" size="4" type="text" value="0"/>
	<br/>
	Desaparecidos: <input id="finalDesaparecidos" name="finalDesaparecidos" title="Desaparecidos" maxlength="7" size="4" type="text" value="0"/>	
	<br/><br/>
	<div id="finalLineasVitalesLeyenda">L&iacute;neas vitales:</div>
	<textarea id="finalLineasVitales" name="finalLineasVitales" title="L&iacute;neas vit&aacute;les" rows="3" cols="50" onKeyUp="alertNumCaracTextArea('finalLineasVitales', 4000);"></textarea>	
	<br/><br/>
	<div id="finalInfraestructuraLeyenda">Infraestructura da&ntilde;ada:</div>
	<textarea id="finalInfraestructura" name="finalInfraestructura" title="Infraestructura da&ntilde;ada" rows="3" cols="50" onKeyUp="alertNumCaracTextArea('finalInfraestructura',4000);"></textarea>
	<br/>
	<br/>
	Respuesta institucional: <br/>
<?php
	$query = oci_parse($conOracle, 'SELECT ID, NOMBRE from CENACOM.DEPENDENCIAS ORDER BY ID');
	comboMultiple($query, "ID", "NOMBRE", 'finalRespuestaInstitucional', 'Respuesta institucional');
?>
	
	<br/>	
	<br/>
	<div id="finalObservacionesLeyenda">Observaciones:</div>
	<textarea id="finalObservaciones" name="finalObservaciones" title="Observaciones" rows="3" cols="50" onKeyUp="alertNumCaracTextArea('finalObservaciones', 4000);"></textarea>
	<br/>
	<br/>
	
<!-- Funciones y datos anadiendo layers -->	
<?php
	$query = oci_parse($conOracle, "SELECT COUNT(ID_USUARIO) AS CUENTA from CENACOM.USUARIOS_CENACOM");
	$numAutores=contarRegistros($query);
?>
<script language="JavaScript">
	function agregarAutor(bloque, cuenta){
		autoresBD=<?php print $numAutores; ?>;
		autoresForm=cuentaElementosBloque(bloque);
		if(autoresBD == autoresForm){
			alert("No se pueden agregar m&aacute;s autores")
		}else{
			escribeLayerAutor(cuenta)
		}		
	}
	
	function agregarLink(bloque, cuenta){
		numeroLinks=4;		
		linkForm=cuentaElementosBloque(bloque);
		if(linkForm == numeroLinks){
			alert("Solo se pueden agregar "+numeroLinks+" Links")
		}else{
			escribeLayerLink(cuenta)
		}		
	}		
	
</script>
<!-- FIN Funciones y datos anadiendo layers -->


	<div id="agregarLink"><a href="#links" onclick="agregarLink('link', 1);">Agregar otro link</a></div>
	<div id="link" >
		<div id="links0">
		T&iacute;tulo de noticia:
		<input id="titulolinks0T" name="titulolinks0T" title="T&iacute;tulo de link" size="49" maxlength="990" type="text" value=""/>
		<br/>
		Link de noticia: <input id="links0T" name="links0T" title="URL del link" maxlength="980" size="50" type="text" value=""/>
		</div>	
	</div>
	<a name="links"></a>	
	<input type="hidden" name="finalLinks" id="finalLinks">
	<input type="hidden" name="finalTituloLinks" id="finalTituloLinks">
<br/>
<br/>
<!-- Para agregar autores de forma de capas	
<div id="autor"></div>
<a name="autores"></a>
<div id="agregarAutor"><a href="#autores" onclick="agregarAutor('autor', 0);">Agregar Autor</a></div>
FIN Para agregar autores de forma de capas -->
Usuario(s) que registra(n) el reporte: <br/>
<?php
	$query = oci_parse($conOracle, 'SELECT ID_TURNO, NOMBRE from CENACOM.TURNOS ORDER BY ID_TURNO');
	comboQueryJSMultiple($query,"ID_TURNO", 'NOMBRE', 'finalAutoresTurnoC', 'finalAutoresC', 'autores', 'Seleccionar turno','Autores');
?>
	<input type="hidden" name="finalAutores" id="finalAutores" value="0">
	<input type="hidden" name="finalAutoresTurno" id="finalAutoresTurno" title="finalAutoresTurno hidden" value="0">
	<br/>
	<br/>
<?php
	$finalObservacionesEvento=obtenerValorQuery($conOracle,'CENACOM', 'EVENTO', 'ID_EVENTO', $idEvento, 'OBSERVACIONES');
?>
	<div id="finalObservacionesEventoLeyenda">Observaciones Generales del evento:</div>
	<textarea id="finalObservacionesEvento" name="finalObservacionesEvento" title="Obervaciones Generales del evento" rows="3" cols="50" onKeyUp="alertNumCaracTextArea('finalObservacionesEvento', 4000);"><?php echo $finalObservacionesEvento; ?></textarea>		
	<br/>	
	<br/>
<?php
	$finalDanosMaterialesEvento=obtenerValorQuery($conOracle,'CENACOM', 'EVENTO', 'ID_EVENTO', $idEvento, 'DANOS_MATERIALES');
?>
	<div id="finalDanosMaterialesEventoLeyenda">Da&ntilde;os Materiales Generales del evento:</div> 
	<textarea id="finalDanosMaterialesEvento" name="finalDanosMaterialesEvento" title="Da&ntilde;os Materiales Generales del evento" rows="3" cols="50" onk onKeyUp="alertNumCaracTextArea('finalDanosMaterialesEvento', 4000);"><?php echo $finalDanosMaterialesEvento; ?></textarea>
	<br/>
	<br/>
	Declaratoria: <br/>
	<select id="finalDeclaratoria"  name="finalDeclaratoria" title="Declaratoria">
<?php
	$finalDeclaratoria=obtenerValorQuery($conOracle,'CENACOM', 'EVENTO', 'ID_EVENTO', $idEvento, 'DECLARATORIA');
	if($finalDeclaratoria=="NO"){
?>
	<option value="NO">No</option>
	<option value="SI">Si</option>
<?php
	}else{
?>
	<option value="SI">Si</option>
	<option value="NO">No</option>
<?php
	}

?>
	
	</select>	
	<br/>	
	<br/>	
	
	

	<div id="boton">
		<input type="button"  value="Registrar" onclick="valida()" />
	</div>
</form>


			</div>
		</div>
		<!-- FIN DE IZQUIERDA -->
		
	<?php
		//include 'derechaForm.php';
	?>	

		<div class="right">
						
			<div class="rt"></div>
			<div class="right_articles">
			<?php 
			$dato = recuperaCampo($conOracle, 'CENACOM.TIPO_FENOMENO', 'NOMBRE', $finalTipoFenomeno, 'ID_FENOMENO');
			echo "<b>Fen&oacute;meno:</b> ".$dato;
			echo "<br>";
			
			$dato = recuperaCampo($conOracle, 'ANRO.LOCALIDADES', 'NOM_ENT', $finalEstado, 'ENTIDAD');
			echo "<b>Estado:</b> ".$dato;
			echo "<br>";
			
			$query = oci_parse($conOracle, 'SELECT NOM_MUN from ANRO.LOCALIDADES WHERE ENTIDAD = '.$finalEstado.' AND MUN ='.$finalMunicipio.' GROUP BY NOM_MUN');
			oci_execute($query);
			$row = oci_fetch_array($query, OCI_ASSOC);
			$dato= $row["NOM_MUN"];
			echo "<b>Municipio:</b> ".$dato;
			echo "<br>";
			
			$dato = $finalFechaFenomenoM;
			echo "<b>Fecha:</b> ".$dato;
			
			?>
			</div>
		</div>	

<?php
	cerrarConexionORACLE($conOracle);
?>

		<div class="footer">
			<p>Sistema Nacional de Protecci&oacute;n Civil</p>
		</div>
	</div>
</body>
</html>