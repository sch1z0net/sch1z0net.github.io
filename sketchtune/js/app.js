
  let isDragging = false;
  let activeDraggable = null;
  document.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const x = event.clientX + $("beat-bar").scrollLeft() - 20;
      const y = event.clientY;

      var newmargin = x - activeDraggable.offsetWidth / 2;
      if(newmargin < 0){
         newmargin = 0;
      }
      activeDraggable.style.marginLeft = newmargin + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
     isDragging = false;
     activeDraggable.style.marginLeft = (Math.round(parseInt(activeDraggable.style.marginLeft) / 20) * 20) + "px";
  });



  var tracks_height_sum = 0;
  var tracks_row_length = 0;

  class BeatCol extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
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
      tracks_row_length += 20; //+2 Because of border
    }
  }

  class BeatBar extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      for(var i = 1; i<=40; i++){
         $(this).append($("<beat-col>").attr('data-beat',i));
      }
    }
  }

  class BeatBarHeader extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
    }
  }

  class BeatBarContainer extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).append($("<beat-bar-header>"));
      $(this).append($("<beat-bar>"));
    }
  }












  class TrackPattern extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.addEventListener('mousedown', (event) => {
         isDragging = true;
         //this.classList.add('dragging');
         activeDraggable = this;
      });
    }
  }

  class TrackRowEmpty extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
    }
  }

  class TrackRow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
       $(this).addClass("unselectable");
        tracks_height_sum += 20;
        $('beat-bar').css("max-height",tracks_height_sum+"px");
        $('track-row-empty').css("max-height","calc(100% - "+tracks_height_sum+"px - 20px)");

        $(this).dblclick(function(event) {
           $(this).append($('<track-pattern>').css("margin-left",0+"px"));
        });
    }
  }

  class TrackRowContainer extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).css("width",tracks_row_length+"px")
    }
  }

  class TrackWindow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).append("<track-row-container>");
    }
  }



  class GridWindow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).append("<beat-bar-container>");
      $(this).append("<track-window>");
    }
  }










  class TrackTitle extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
    }
  }

  class TrackTitleContainer extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
     $(this).addClass("unselectable");
     try {
      for(var i = 1; i<60; i++){
         var color = "hsl("+(i*4)+",75%,85%)";
         $(this).append($("<track-title>").css("background-color",color));
         var trackrow = document.createElement('track-row');
         var trackpat = document.createElement('track-pattern');
         $(trackpat).css("margin-left",(i*5)+"px");
         $(trackrow).append($(trackpat));
         $("track-row-container").append($(trackrow));
      }
     } catch (error) {
        console.error('Error while creating DOM:', error);
     }
    }
  }

  class SideWindow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).append("<track-title-container>");
    }
  }

$(document).ready(function(){

  // Define the custom element
  customElements.define('beat-col'    , BeatCol);
  customElements.define('beat-bar'    , BeatBar);
  customElements.define('beat-bar-header' , BeatBarHeader);
  customElements.define('beat-bar-container'    , BeatBarContainer);

  customElements.define('track-pattern' , TrackPattern);
  customElements.define('track-row'   , TrackRow);
  customElements.define('track-row-empty'   , TrackRowEmpty);
  customElements.define('track-row-container'  , TrackRowContainer);
  customElements.define('track-window', TrackWindow);

  customElements.define('grid-window' , GridWindow);

  customElements.define('track-title' , TrackTitle);
  customElements.define('track-title-container', TrackTitleContainer);
  customElements.define('side-window' , SideWindow);

  $("#root").append($("<grid-window>"));
  $("#root").append($("<side-window>"));


  $("#root").bind('wheel', function(e) {
       $("track-window").scrollTop(e.originalEvent.deltaY + $("track-window").scrollTop());
       $("track-title-container").scrollTop(e.originalEvent.deltaY + $("track-title-container").scrollTop());

       $("beat-bar").scrollLeft(e.originalEvent.deltaX + $("beat-bar").scrollLeft());
       $("track-window").scrollLeft($("beat-bar").scrollLeft());
  });


});