/*
* Mastermind - septembre 2014
* Cyril Moreau - @cycymomo - MIT Licence
*/

;(function(global, undefined) {
  "use strict";

  if (!global.document) {
    throw 'The game must be launched in the browser (DOM API required)'; 
  }
  
  var fn_buildGame, fn_pickRandomColor, fn_toogleSolution, fn_tooglePalette,
      a_couleurs_a_trouver, a_grid_couleurs_tentees, a_couleurs_a_choisir,
      str_couleurAChoisir,
      div_couleurs_a_trouver, div_couleurs_tentees, div_couleurs_a_choisir, div_palette,
      NB_TENTATIVES, NB_CHOIX, COULEURS_POSSIBLES;
  
  NB_TENTATIVES = 10;
  NB_CHOIX = 4;
  COULEURS_POSSIBLES = ['#f00', '#0f0', '#00f', '#ff0', '#fff', '#bbb', '#f80', '#f0f'];
  
  a_couleurs_a_trouver = [];
  a_grid_couleurs_tentees = [];
  a_couleurs_a_choisir = [];
  
  div_couleurs_a_trouver = document.getElementById('couleurs_a_trouver');
  div_couleurs_tentees = document.getElementById('couleurs_tentees');
  div_couleurs_a_choisir = document.getElementById('couleurs_a_choisir');
  div_palette = document.getElementById('palette');
  
  /*
  * COULEUR ALEATOIRE
  */
  fn_pickRandomColor = function() {
    var colorPicked = COULEURS_POSSIBLES[Math.floor(Math.random() * COULEURS_POSSIBLES.length)];
    
    return a_couleurs_a_trouver.indexOf(colorPicked) === -1 ? colorPicked : fn_pickRandomColor();
  };
  
  /*
  * TOGGLE SOLUTION
  */
  fn_toogleSolution = function() {
    div_couleurs_a_trouver.style.display = !div_couleurs_a_trouver.style.display || div_couleurs_a_trouver.style.display === 'none' ? 'block' : 'none';
  };
  
  /*
  * TOGGLE PALETTE COULEUR
  */
  fn_tooglePalette = function(event) {
    div_palette.style.display = !div_palette.style.display || div_palette.style.display === 'none' ? 'block' : 'none';
    str_couleurAChoisir = event.target.id.split('_')[3];
  };
  
  /*
  * CONSTRUCTION DU JEU
  */  
  fn_buildGame = function() {    
    var temp_tentatives = NB_TENTATIVES,
        temp_choix = 0,
        div_rows, span_columns;
    
    /*
    * Build : palette de couleurs
    */
    temp_choix = 0;
    while(temp_choix < COULEURS_POSSIBLES.length) {
      span_columns = global.document.createElement('span');
      span_columns.id = 'palette_' + temp_choix;
      span_columns.style.backgroundColor = COULEURS_POSSIBLES[temp_choix++];
      
      div_palette.appendChild(span_columns);
      
      span_columns.onclick = function() {
        var iColor = this.id.split('_')[1];
        document.getElementById('couleurs_a_choisir_' + str_couleurAChoisir).style.backgroundColor = COULEURS_POSSIBLES[iColor];
        fn_tooglePalette();
      };
    }
    
    /*
    * Build : couleurs à trouver
    */
    temp_choix = 0;
    
    while(temp_choix < NB_CHOIX) {
      var randomColor = fn_pickRandomColor();
      a_couleurs_a_trouver.push(randomColor);
      
      span_columns = global.document.createElement('span');
      span_columns.id = 'couleurs_a_trouver_' + temp_choix++;
      span_columns.style.backgroundColor = randomColor;

      div_couleurs_a_trouver.appendChild(span_columns);
    }
    
    /*
    * Build : grille des tentatives
    */    
    temp_tentatives = NB_TENTATIVES;
    temp_choix = 0;

    while(temp_tentatives--) {
      div_rows = global.document.createElement('div');
      div_rows.id = temp_tentatives;
      a_grid_couleurs_tentees[temp_tentatives] = [];
  
      while(temp_choix < NB_CHOIX) {
        span_columns = global.document.createElement('span');
        span_columns.id = temp_tentatives + '.' + temp_choix++;
        
        div_rows.appendChild(span_columns);
      }
      
      temp_choix = 0;
      div_couleurs_tentees.appendChild(div_rows);
    }
    
    /*
    * Build : couleurs à choisir
    */
    temp_choix = 0;
    
    while(temp_choix < NB_CHOIX) {
      span_columns = global.document.createElement('span');
      span_columns.id = 'couleurs_a_choisir_' + temp_choix++;

      div_couleurs_a_choisir.appendChild(span_columns);
      
      span_columns.onclick = fn_tooglePalette;
    }
  };
  
  // Lancement du jeu + bind des événements
  fn_buildGame();
  
  document.getElementById('btn_toggleSolution').onclick = fn_toogleSolution;
  
}(this));