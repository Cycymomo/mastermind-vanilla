/*
* Mastermind VanillaJS - septembre 2014
* Cyril Moreau - @cycymomo - MIT Licence
*/

;(function(global, undefined) {
  "use strict";

  if (!global.document) {
    throw 'The game must be launched in the browser (DOM API required)';
  }

  var fn_buildGame, fn_buildGridTentatives, fn_buildLine,
      fn_pickRandomColor, fn_toogleSolution, fn_openPalette, fn_closePalette, fn_selectColor, fn_validColor, fn_resetColor, fn_displayResult, fn_displayFin,
      a_couleursATrouver, a_gridCouleursTentees, a_couleursAChoisir, i_couleurAChoisir,
      div_couleursATrouver, div_couleursTentees, div_couleursAChoisir, div_palette,
      NB_TENTATIVES, NB_COLOR, COULEURS_POSSIBLES;

  NB_TENTATIVES = 10;
  NB_COLOR = 4;
  COULEURS_POSSIBLES = ['#f00', '#0f0', '#00f', '#ff0', '#fff', '#bbb', '#f80', '#f0f'];

  a_couleursATrouver = [];
  a_gridCouleursTentees = global.localStorage.str_gridCouleursTentees ? JSON.parse(global.localStorage.str_gridCouleursTentees) : [];
  a_couleursAChoisir = [];

  div_couleursATrouver = global.document.getElementById('couleursATrouver');
  div_couleursTentees = global.document.getElementById('couleursTentees');
  div_couleursAChoisir = global.document.getElementById('couleursAChoisir');
  div_palette = global.document.getElementById('palette');

  /*
  * RANDOM COLOR
  */
  fn_pickRandomColor = function fn_pickRandomColor() {
    var i_colorPicked = Math.floor(Math.random() * COULEURS_POSSIBLES.length);

    return a_couleursATrouver.indexOf(i_colorPicked) === -1 ? i_colorPicked : fn_pickRandomColor();
  };

  /*
  * TOGGLE SOLUTION DISPLAY
  */
  fn_toogleSolution = function fn_toogleSolution() {
    div_couleursATrouver.style.display = !div_couleursATrouver.style.display || div_couleursATrouver.style.display === 'none' ? 'block' : 'none';
  };

  /*
  * OPEN PALETTE
  */
  fn_openPalette = function fn_openPalette(event) {
    var i_case, span_couleursAChoisir_x;
  
    if (!(event.target instanceof HTMLSpanElement)) {
      throw "[fn_openPalette] Cette fonction ne peut pas être appelée ici";
    }
    
    i_case = +event.target.id.split('_')[1];
    span_couleursAChoisir_x = global.document.getElementById('couleursAChoisir_' + i_case);
    
    if (!span_couleursAChoisir_x) {
      throw "Impossible de sélectionner cette case";
    }

    div_palette.style.display = 'block';
    i_couleurAChoisir = i_case;
  };

  /*
  * CLOSE PALETTE
  */
  fn_closePalette = function fn_closePalette() {
    div_palette.style.display = 'none';
    i_couleurAChoisir = null;
  };

  /*
  * SELECT COLOR
  */
  fn_selectColor = function fn_selectColor() {
    var span_couleursAChoisir_x = global.document.getElementById('couleursAChoisir_' + i_couleurAChoisir),
        i_color;
  
    if (!(this instanceof HTMLSpanElement)) {
      throw "[fn_selectColor] Cette fonction ne peut pas être appelée ici";
    }
    if (!span_couleursAChoisir_x) {
      throw "Choisir d'abord une case";
    }

    i_color = +this.id.split('_')[1];

    if (!COULEURS_POSSIBLES[i_color]) {
      throw "Cette couleur n'existe pas";
    }
  
    if (a_couleursAChoisir.indexOf(i_color) !== -1 && a_couleursAChoisir[i_couleurAChoisir] !== i_color) {
      throw "Impossible de sélectionner deux couleurs identiques";
    }

    a_couleursAChoisir[i_couleurAChoisir] = i_color;
    span_couleursAChoisir_x.style.backgroundColor = COULEURS_POSSIBLES[i_color];
    fn_closePalette();
  
    if (a_couleursAChoisir.join('').length === NB_COLOR) {
       global.document.getElementById('validChoice').style.visibility = 'visible';
    }
  };

  /*
  * RESET COLOR
  */
  fn_resetColor = function fn_resetColor() {
    a_couleursAChoisir = [];
    for(var i = 0; i < NB_COLOR; i++) {
      global.document.getElementById('couleursAChoisir_' + i).style.backgroundColor = '#fff';
    }
  };

  /*
  * VALID COLOR
  */
  fn_validColor = function fn_validColor() {
    var temp_tentatives = a_gridCouleursTentees.length, i, len, span_columns;
    
    // copie du tableau par valeur
    // @TODO: localstorage ?
    a_gridCouleursTentees.push(a_couleursAChoisir.slice());
    
    // mise à jour de la vue
    global.document.getElementById('validChoice').style.visibility = 'hidden';
    for (i = 0, len = a_couleursAChoisir.length; i < len; i++) {
      fn_buildLine(div_couleursTentees, temp_tentatives + '.' + i, COULEURS_POSSIBLES[a_couleursAChoisir[i]]);
    }
    // Pour afficher le résultat : @TODO à changer
    span_columns = global.document.createElement('span');
    span_columns.id = temp_tentatives + '.nbBlanc';
    span_columns.className = 'rowResultBlanc';
    div_couleursTentees.appendChild(span_columns);
    span_columns = global.document.createElement('span');
    span_columns.id = temp_tentatives + '.nbRouge';
    span_columns.className = 'rowResultRouge';
    div_couleursTentees.appendChild(span_columns);

    // mise à jour du résultat + check si victoire/défaite
    fn_displayResult(temp_tentatives);
    
    // effacement du tableau des couleursà choisir
    fn_resetColor();
  };

  /*
  * DISPLAY RESULT
  */
  fn_displayResult = function fn_displayResult(temp_tentatives) {
    var temp_choix = a_couleursAChoisir.join(''),
        temp_solution = a_couleursATrouver.join(''),
        span_nbBlanc = global.document.getElementById(temp_tentatives + '.nbBlanc'),
        span_nbRouge = global.document.getElementById(temp_tentatives + '.nbRouge'),
        i_nbBlanc = 0, i_nbRouge = 0;
    
    if (!span_nbBlanc || !span_nbRouge) {
      throw "Impossible d'afficher le résultat";
    }
    
    if (temp_choix === temp_solution) {
      fn_displayFin(true, temp_tentatives+1);
    } else if (temp_tentatives+1 === NB_TENTATIVES) {
      fn_displayFin();
    } else {
      a_couleursAChoisir.forEach(function(element, index) {
        if (element === a_couleursATrouver[index]) {
          i_nbRouge++;
        } else if (a_couleursATrouver.indexOf(element) !== -1) {
          i_nbBlanc++;
        }
      });
      span_nbBlanc.innerHTML = i_nbBlanc;
      span_nbRouge.innerHTML = i_nbRouge;
    }
  };

  /*
  * DISPLAY FIN
  */
  fn_displayFin = function fn_displayFin(win, temp_tentatives) {
    global.alert(win ? 'Gagné en ' + temp_tentatives + ' coups !' : 'Perdu');
    global.location.reload();
  };

  /*
  * UTIL : Ajouter une ligne
  */
  fn_buildLine = function fn_buildLine(div, id, color, cb) {
    var span_columns;

    span_columns = global.document.createElement('span');
    span_columns.id = id;
    span_columns.style.backgroundColor = color;
    if (cb) {
      span_columns.onclick = cb;
    }
    div.appendChild(span_columns);
  };

  /*
  * CONSTRUCTION DU JEU
  */ 

  /*
  * Build : grille des tentatives
  */
  fn_buildGridTentatives = function fn_buildGridTentatives() {
    var span_columns, div_rows, i, j, len;
    
    for (i = 0, len = a_gridCouleursTentees.length; i < len; i++) {
      div_rows = global.document.createElement('div');
      div_rows.id = i;

      for (j = 0; j < NB_COLOR; j++) {
        fn_buildLine(div_rows, i + '.' + j, a_gridCouleursTentees[i][j]);
      }

      // Pour afficher le résultat
      span_columns = global.document.createElement('span');
      span_columns.id = i + '.nbBlanc';
      span_columns.className = 'rowResultBlanc';
      div_rows.appendChild(span_columns);
      span_columns = global.document.createElement('span');
      span_columns.id = i + '.nbRouge';
      span_columns.className = 'rowResultRouge';
      div_rows.appendChild(span_columns);

      div_couleursTentees.appendChild(div_rows);
    }
  };

  /*
  * Build du jeu : palette de couleurs + les couleurs à trouver / choisir
  */
  fn_buildGame = function fn_buildGame() {
    var i, i_randomColor;

    // palette de couleurs
    for (i = 0; i < COULEURS_POSSIBLES.length; i++) {
      fn_buildLine(div_palette, 'palette_' + i, COULEURS_POSSIBLES[i], fn_selectColor);
    }
    
    for (i = 0; i < NB_COLOR; i++) {
      // couleurs à trouver
      i_randomColor = fn_pickRandomColor();
      a_couleursATrouver.push(i_randomColor);
      fn_buildLine(div_couleursATrouver, 'couleursATrouver_' + i, COULEURS_POSSIBLES[i_randomColor]);
      
      // couleurs à choisir
      fn_buildLine(div_couleursAChoisir, 'couleursAChoisir_' + i, '#fff', fn_openPalette);
    }

    fn_buildGridTentatives();
  };

  // Lancement du jeu
  fn_buildGame();
  
  // bind events globaux
  global.document.getElementById('toggleSolution').onclick = fn_toogleSolution;
  global.document.getElementById('validChoice').onclick = fn_validColor;
}(this));
