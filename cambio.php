<?php
include 'functions.php';
include 'vars.php';
require_once('FirePHPCore/FirePHP.class.php');
ob_start();
$firephp = FirePHP::getInstance(true);
session_start();
if(@$_SESSION['login'] != "si")
{
header("Location:index.php");
exit();
}
$conOracle=conexionORACLE($HOST, $PORT, $SID, $userName, $passkey,'AL32UTF8');
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<!--<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />-->
<title>Modificaci&oacute;n</title>
<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/dojo/1.8/dijit/themes/claro/claro.css">
<link rel="stylesheet" href="images/style.css" type="text/css" />
<script src="//ajax.googleapis.com/ajax/libs/dojo/1.8.0/dojo/dojo.js" data-dojo-config='async: true, parseOnLoad: true'></script>
<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript" src="js/functions.js"></script>
<script type="text/javascript" src="js/validacionInicial.js"></script>
<script>
require(["dojo/parser", "dijit/form/DateTextBox"]);
</script>

</head>
<body class="claro">
	
	<?php
	include 'formsMenuHead.php';
	?>
	
	
<h1>Sistema de captura</h1>

		<!--IZQUIERDA -->
		<div class="left">
			<div class="lboxForm">
	<BR/>		
	<h2>Cambio de contrase&ntilde;a</h2>
	<BR/>
	
<?php
	/*Validación de campos para cambio de contraseña*/
///////////////////////////////////////////////////////////	
	/*Validar usuario*/
	if (@$_POST["UsrAct"]){
		$firephp->log($_POST["UsrAct"]);
		$valorUsrAct=sanitize_sql_string($_POST["UsrAct"]);
		//echo $valorUsrAct;

		$querypassAct = oci_parse($conOracle,"select PASSWORD from CENACOM.ADMINISTRADORES WHERE USUARIO ='".$valorUsrAct."'");
		oci_execute($querypassAct);
		$rowpassAct = oci_fetch_array($querypassAct, OCI_NUM);
		$confipassAct = $rowpassAct[0];

		$queryCompAct = oci_parse($conOracle,"select USUARIO from CENACOM.ADMINISTRADORES WHERE PASSWORD ='".$confipassAct."'");
		oci_execute($queryCompAct);
		$rowpassActUsr = oci_fetch_array($queryCompAct, OCI_NUM);
		$confiUsr = $rowpassActUsr[0];
		
		if ($valorUsrAct != $confiUsr){
			echo "<div class='avisoError'>Usuario no registrado.</div>";
	/*Fin Validar pass*/			
		}else{
		/*Validar nuevo pass*/
			if (@$_POST["passNueva"] AND @$_POST["passConfi"]){
				$firephp->log($_POST["passNueva"]);
				$valorpassNueva=sanitize_sql_string($_POST["passNueva"]);
				
				$firephp->log($_POST["passConfi"]);
				$valorpassConfi=sanitize_sql_string($_POST["passConfi"]);
				if ($valorpassNueva == $valorpassConfi){
					if($valorpassConfi == $confipassAct){
						echo "<div class='avisoError'>La contrase&ntilde;a actual no debe ser igual a la nueva contrase&ntilde;a, favor de ingresar otros valores.</div>";
					}else{
						$delta = $valorpassConfi;
						$queryCam = oci_parse($conOracle,"UPDATE CENACOM.ADMINISTRADORES SET PASSWORD ='".$delta."' WHERE '".$valorpassNueva."'='".$valorpassConfi."' AND USUARIO ='".$valorUsrAct."'");
						if (!$queryCam) {
							$e = oci_error($conOracle);
							trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
						}
						$resultadoUpdate=oci_execute($queryCam);
						if (!$resultadoUpdate) {
							$e = oci_error($queryCam);
							trigger_error(htmlentities($e['message'], ENT_QUOTES), E_USER_ERROR);
						}
						if($resultadoUpdate){
							echo '<div class="aviso"><b>Actualizaci&oacute;n correcta.</b><br/></div>';
						}
					}
				}else{
					echo "<div class='avisoError'>Las contrase&ntilde;as ingresadas no coinciden.</div>";
				}
			}
		}
		
		
///////////////////////////////////////////////////////////			

	}

	/*Fin Validación de campos para cambio de contraseña*/	
	echo	"<br/>";
?>
	
	<form method="post" id="fadmin" name="fadmin" action="cambio.php">
	Nombre de usuario:
	<input id="UsrAct" name="UsrAct" title="UsrAct" maxlength="20" size="30" type="text"/>		
	<br/><br/>
	Nueva contrase&ntilde;a:
	<input id="passNueva" name="passNueva" title="passNueva" maxlength="20" size="30" type="password"/>		
	<br/><br/>
	Confirmar nueva contrase&ntilde;a:
	<input id="passConfi" name="passConfi" title="passConfi" maxlength="20" size="30" type="password"/>		
	<br/><br/>
	
	
	<div id="boton">
		<input type="submit"  value="cambiar" />
	</div>
	</form>
	

<?php
	cerrarConexionORACLE($conOracle);
?>

			</div>
		</div>
		<!-- FIN DE IZQUIERDA -->

		
	<?php
		include 'derechaC.php';
	?>	

	
		<div class="footer">
			<p>Sistema Nacional de Protecci&oacute;n Civil</p>
		</div>

</body>
</html>

