
$(document).ready(function() {

  class GridWindow extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
    }

    connectedCallback() {
        // Add any initial setup logic here
    }
  }

  class BeatBar extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
    }

    connectedCallback() {
      for(var i = 1; i<100; i++){
         $(this).append($("<beat-col>").attr('data-beat',i));
      }
    }
  }

  class BeatCol extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
      var beat = $(this).attr('data-beat');
      if(((beat-1) % 4) == 0){
        $(this).addClass("fullbar");
      }
      if(((beat-1) % 8) < 4){
        $(this).addClass("col_b");
      }else{
        $(this).addClass("col_a");
      }
      $(this).append($('<span>').text(beat)); 
    }

    connectedCallback() {

    }
  }

  class TrackWindow extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
    }

    connectedCallback() {
        // Add any initial setup logic here
    }
  }

  class TrackRow extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
    }

    connectedCallback() {
        // Add any initial setup logic here
    }
  }

  // Define the custom element
  customElements.define('grid-window' , GridWindow);
  customElements.define('beat-bar'    , BeatBar);
  customElements.define('beat-col'    , BeatCol);
  customElements.define('track-window', TrackWindow);
  customElements.define('track-row'   , TrackRow);


});