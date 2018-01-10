#version 300 es

precision mediump float;


// we need to declare an output for the fragment shader
out vec4 outColor;

in float colorValue;

in float alphaValue;

void main() {

  if (colorValue < 0.31)
  {
    outColor = vec4(0.3, 1, 0, 0.7);
    return;
  }

  outColor = vec4(0,0,1,0.6);



  if (colorValue < 0.61)
  {
    outColor = vec4(0, 0, 1, 0.7);
    return;
  }
  
  if (colorValue < 0.9)
  {
    outColor = vec4(0, 0, 0, 0.15);
    return;
  }
  
  if (colorValue < 0.92)
  {
    outColor = vec4(0, 0, 0, 0.6);
    return;
  }
  
  if (colorValue < 0.97)
  {
    outColor = vec4(0, 0, 0, 0.6);
    return;
  }

  float
    rAlpha = 0.7f;

  if (colorValue == float (1))
  {
    // AA115
    
    // RED
    outColor = vec4(1, 0, 0, rAlpha);
    return;
  }
  
  if (colorValue == float(2))
  {
    // ATTF

    // GREEN
    outColor = vec4(0, 1, 0, rAlpha);
    return;
  }
  
  if (colorValue == float(3))
  {
    // BIST14A

    // BLUE
    outColor = vec4(0, 0, 1, rAlpha);
    return;
  }

  if (colorValue == float(4))
  {
    // TILTAK

    // CYAN
    outColor = vec4(0, 1, 1, rAlpha);
    return;
  }

  if (colorValue == float(5))
  {
    // BEHOV

    // PURPLE
    outColor = vec4(1, 0, 1, rAlpha);
    return;
  }

  if (colorValue == float(6))
  {
    // BASI

    // PURPUR
    outColor = vec4(0.5, 0, 0.5, rAlpha);
    return;
  }

  if (colorValue == float(9))
  {
    // DAGO

    // YELLOW
    outColor = vec4(1, 1, 0, rAlpha);
    return;
  }

  if (colorValue == float(22))
  {
    // AAP

    // ORANGE
    outColor = vec4(1, 0.50, 0, rAlpha);
    return;
  }

  if (colorValue == float(23))
  {
    // ATTP

    // LIME
    outColor = vec4(0.5, 1, 0, rAlpha);
    return;
  }

  // GRAY FOR THE REST
  outColor = vec4(0.5, 1, 0, rAlpha);

/*
  if (colorValue == float(7))
  {
    // IDAG
    
    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(8))
  {
    // ATTK

    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  

  if (colorValue == float(10))
  {
    // PERM

    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }
  
  if (colorValue == float(11))
  {
    // BTIL
    
    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(12))
  {
    // TILU
    
    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(13))
  {
    // ISEM
    
    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(14))
  {
    // FRI_MK_AAP

    // GRAY
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(15))
  {
    // ISKO
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(16))
  {
    // IEKS
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(17))
  {
    // FSTO
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(18))
  {
    // RSTO
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(19))
  {
    // AAUNGUFOR
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(20))
  {
    // IUND
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(21))
  {
    // LREF
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(24))
  {
    // SKOP
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(25))
  {
    // IREI
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  if (colorValue == float(26))
  {
    // ADAGR
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }
  if (colorValue == float(27))
  {
    // TSODAGREIS
    outColor = vec4(0, 0, 0, rAlpha);
    return;
  }

  // UNKNOWN
  outColor = vec4(0, 0, 0, rAlpha);
 */
}
      
     
      