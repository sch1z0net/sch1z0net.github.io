
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
        // Add any initial setup logic here
    }
  }

  class BeatCol extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
      var beat = $(this).attr('data-beat');
      if(beat % 8 < 4){
         $(this).addClass("col_b");
      }else{
         $(this).addClass("col_a");
      }
      
    }

    connectedCallback() {

    }
  }

  class Track extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
    }

    connectedCallback() {
        // Add any initial setup logic here
    }
  }

  // Define the custom element
  customElements.define('grid-window', GridWindow);
  customElements.define('beat-bar', BeatBar);
  customElements.define('beat-col', BeatCol);


});