
$(document).ready(function() {

  $("#root").bind('wheel', function(e) {
       $("track-window").scrollTop(e.originalEvent.deltaY + $("track-window").scrollTop());
       $("track-title-container").scrollTop(e.originalEvent.deltaY + $("track-title-container").scrollTop());

       $("beat-bar").scrollLeft(e.originalEvent.deltaX + $("beat-bar").scrollLeft());
  });

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
      
    }
  }

  var tracks_height_sum = 0;

  class TrackRow extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
    }

    connectedCallback() {
        tracks_height_sum += 20;
        $('beat-bar').css("max-height",tracks_height_sum+"px");
        $('track-row-empty').css("max-height","calc(100% - "+tracks_height_sum+"px - 20px)")
    }
  }

  class SideWindow extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
    }

    connectedCallback() {
    }
  }

  class TrackTitleContainer extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
    }

    connectedCallback() {
      for(var i = 1; i<120; i++){
         var color = "hsl("+i+",75,75)";
         $(this).append($("<track-title>").css("background-color",color));
         $("track-window").append($("<track-row>"));
      }
    }
  }

  class TrackTitle extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
    }

    connectedCallback() {
    }
  }


  // Define the custom element
  customElements.define('grid-window' , GridWindow);
  customElements.define('beat-bar'    , BeatBar);
  customElements.define('beat-col'    , BeatCol);
  customElements.define('track-window', TrackWindow);
  customElements.define('track-row'   , TrackRow);
  customElements.define('side-window' , SideWindow);
  customElements.define('track-title-container', TrackTitleContainer);
  customElements.define('track-title' , TrackTitle);

});