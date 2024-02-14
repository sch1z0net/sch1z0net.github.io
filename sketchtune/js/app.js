
$(document).ready(function() {

  $("#root").bind('wheel', function(e) {
       $("track-window").scrollTop(e.originalEvent.deltaY + $("track-window").scrollTop());
       $("track-title-container").scrollTop(e.originalEvent.deltaY + $("track-title-container").scrollTop());

       $("beat-bar").scrollLeft(e.originalEvent.deltaX + $("beat-bar").scrollLeft());
       $("track-window").scrollLeft($("beat-bar").scrollLeft());
  });

  class GridWindow extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
      $(this).addClass("unselectable");
    }

    connectedCallback() {
        // Add any initial setup logic here
    }
  }

  class BeatBar extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
      $(this).addClass("unselectable");
    }

    connectedCallback() {
      for(var i = 1; i<=40; i++){
         $(this).append($("<beat-col>").attr('data-beat',i));
      }
    }
  }

  var tracks_height_sum = 0;
  var tracks_row_length = 0;

  class BeatCol extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
      $(this).addClass("unselectable");

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
      tracks_row_length += 20+2; //+2 Because of border
    }

    connectedCallback() {
      
    }
  }

  class TrackWindow extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
      $(this).addClass("unselectable");
    }

    connectedCallback() {
      
    }
  }

  class TrackRowContainer extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
      $(this).addClass("unselectable");
    }

    connectedCallback() {
      $(this).css("width",tracks_row_length+"px")
    }
  }


  class TrackRow extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
      $(this).addClass("unselectable");
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
      $(this).addClass("unselectable");
    }

    connectedCallback() {
    }
  }

  class TrackTitleContainer extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
      $(this).addClass("unselectable");

      for(var i = 1; i<60; i++){
         var color = "hsl("+(i*4)+",75%,85%)";
         $(this).append($("<track-title>").css("background-color",color));
         var tr = $("<track-row></track-row>");
         var tp = $("<track-pattern></track-pattern>").css("margin-left",(i*5)+"px");
         tr.append(tp);
         $("track-row-container").append(tr);
      }
    }

    connectedCallback() {

    }
  }

  class TrackTitle extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;
      $(this).addClass("unselectable");
    }

    connectedCallback() {
    }
  }

  let isDragging = false;
  let activeDraggable = null;
  document.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const x = event.clientX + $("beat-bar").scrollLeft();
      const y = event.clientY;
      activeDraggable.style.marginLeft = x - activeDraggable.offsetWidth / 2 + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    //draggable.classList.remove('dragging');
  });

  class TrackPattern extends HTMLElement {
    constructor(name) {
      super();
      this.name = name;

      this.addEventListener('mousedown', (event) => {
         isDragging = true;
         //this.classList.add('dragging');
         activeDraggable = this;
      });

    }

    connectedCallback() {
    }
  }


  // Define the custom element
  customElements.define('grid-window' , GridWindow);
  customElements.define('beat-bar'    , BeatBar);
  customElements.define('beat-col'    , BeatCol);
  customElements.define('track-window', TrackWindow);
  customElements.define('track-row-container'  , TrackRowContainer);
  customElements.define('track-row'   , TrackRow);
  customElements.define('side-window' , SideWindow);
  customElements.define('track-title-container', TrackTitleContainer);
  customElements.define('track-title' , TrackTitle);
  customElements.define('track-pattern' , TrackPattern);

});