
  let isDragging = false;
  let isResizingR = false;
  let isResizingL = false;
  let isDraggingTitle = false;
  let isSelectingPatterns = false;

  let activePattern = null;
  let activeTrack = null;
  let focusTrack = null;
  let activeInsertSlot = null;
  let activeInsertPosition = null;
  let activePattern_oldmargin = null;
  let xOffsetOnPattern = null;

  let selectRootX = null;
  let selectRootY = null;


  var BEAT_WIDTH = parseInt($("#root").css("--beat-width"));
  var ROOT_PADDING = 20;



  /**** CONTEXT MENU ****/
    // Create context menu
    var contextMenu = $("<div>", {id: "context-menu", "class": "context-menu", css: { display: "none" }});

    // Define colors for the palette
var colors = [
    "#fe9aaa", "#fea741", "#d19d3a", "#f7f58c", "#c1fc40", "#2dfe50", "#34feaf", "#65ffea", "#90c7fc", "#5c86e1",
    "#97abfb", "#d975e2", "#e55ca2", "#ffffff", "#fe3e40", "#f76f23", "#9f7752", "#fff054", "#8dff79", "#42c52e",
    "#11c2b2", "#28e9fd", "#1aa6eb", "#5c86e1", "#8e74e2", "#ba81c7", "#fe41d1", "#d9d9d9", "#e26f64", "#fea67e",
    "#d6b27f", "#eeffb7", "#d6e6a6", "#bfd383", "#a4c99a", "#d9fde5", "#d2f3f9", "#c2c9e6", "#d3c4e5", "#b5a1e4",
    "#eae3e7", "#b3b3b3", "#cb9b96", "#bb8862", "#9f8a75", "#c3be78", "#a9c12f", "#84b45d", "#93c7c0", "#a5bbc9",
    "#8facc5", "#8d9ccd", "#ae9fbb", "#c6a9c4", "#bf7a9c", "#838383", "#b53637", "#ae5437", "#775345", "#dec633",
    "#899b31", "#57a53f", "#139f91", "#256686", "#1a3096", "#3155a4", "#6751ae", "#a752af", "#ce3571", "#3f3f3f"
];




    // Function to create color palette
    function createColorPalette() {
        var palette = $("<div>", {"class": "color-palette"});
        colors.forEach(function (color) {
            var colorItem = $("<div>", {
                "class": "color-item",
                css: { backgroundColor: color }
            });
            palette.append(colorItem);

            colorItem.on("click",function(){
                var id = $(focusTrack).attr("data-id");
                $("#track_"+id).attr("data-stdcolor",color);
                $(focusTrack).css("background-color",color);
                focusTrack = null;
            });

        });
        return palette;
    }

    // Append color palette and target to the body
    $("body").append(contextMenu.append(createColorPalette()));



    $(document).on("click", function (event) {
        if (event.button !== 2) {
            contextMenu.css("display", "none");
            focusTrack = null;
        }
    });

    $(document).on("scroll", function () {
        contextMenu.css("display", "none");
        focusTrack = null;
    });

    $(document).on("contextmenu", function (event) {
        event.stopPropagation();
        event.preventDefault();
    });




    // Create selection area
    var selectionArea = $("<div>", {id: "selectionArea", css: { display: "none" }});
    $("body").append(selectionArea);


  document.addEventListener('mousemove', (event) => {
    //DRAG PATTERN (single or multiple)
    if (isDragging) {
      $(activePattern).addClass("multiSelectedPattern");

      const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;
      var newmarginA = x - xOffsetOnPattern;
      var dx = newmarginA - activePattern_oldmargin;

      var overborder = 0;
      $(".multiSelectedPattern").each(function(){
          var newmargin = this.getBoundingClientRect().left + $("beat-bar").scrollLeft() + dx;
          if(newmargin < 0){ 
            if(newmargin < overborder){ overborder = newmargin; }
          }
      });
      overborder = -overborder;

      newmarginA = activePattern.getBoundingClientRect().left + $("beat-bar").scrollLeft() + dx + overborder;
      if(newmarginA < 0){ newmarginA = 0; }
      activePattern_oldmargin = newmarginA; 
      activePattern.style.marginLeft = newmarginA + 'px';

      $(".multiSelectedPattern").each(function(){
          if(this != activePattern){
            var newmargin = this.getBoundingClientRect().left + $("beat-bar").scrollLeft() + dx + overborder;
            this.style.marginLeft = newmargin + 'px';
          }
      });
    }

    //Resize on Right side
    if (isResizingR) {
      const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;
      var posStart = parseInt(activePattern.style.marginLeft);

      var newwidth = x - posStart;
      if(newwidth < BEAT_WIDTH){ newwidth = BEAT_WIDTH; }
      activePattern.style.width = newwidth + 'px';
    }
    //Resize on Left side
    if (isResizingL) {
      const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;

      var posEnd = parseInt(activePattern.style.marginLeft) + activePattern.offsetWidth;
      var newmargin = x;
      if(newmargin < 0){ newmargin = 0; }
      var posStart = newmargin;

      var newwidth = posEnd - posStart;
      if(newwidth < BEAT_WIDTH){ newwidth = BEAT_WIDTH; }
      activePattern.style.marginLeft = newmargin + 'px';
      activePattern.style.width = newwidth + 'px';
    }

    if (isDraggingTitle) {
      const y = event.clientY;
      
      $('track-title').each(function(){
          $(this).removeClass("insertMarkB");
          $(this).removeClass("insertMarkT");
          if($(this).is(':hover')) { 
            activeInsertSlot = this;
            var clientRect = this.getBoundingClientRect();
            var clientT = clientRect.top;
            var clientB = clientRect.bottom;
            if(Math.abs(y-clientB) > Math.abs(y-clientT)){
               $(this).addClass("insertMarkT"); 
               activeInsertPos  = "top";
            }else{
               $(this).addClass("insertMarkB"); 
               activeInsertPos  = "bot";
            }
          }
      });
    }

    if (isSelectingPatterns) {
      var x2 = event.clientX;
      var y2 = event.clientY;
      var x1 = selectRootX;
      var y1 = selectRootY;   
      var w = x2 - x1;
      var h = y2 - y1;  

      if(w < 0){ w = -w; x2 = x1; x1 = x1 - w;}
      if(h < 0){ h = -h; y2 = y1; y1 = y1 - h;}

      selectionArea.css("display", "block");
      selectionArea.css("left", x1 + "px");
      selectionArea.css("top", y1 + "px");
      selectionArea.css("width", w);
      selectionArea.css("height", h);

      $("track-pattern").each(function(){
          $(this).removeClass("multiSelectedPattern");
      });

      $("track-pattern").each(function(){
          var clientRect = this.getBoundingClientRect();
          var clientT = clientRect.top;
          var clientB = clientRect.bottom;
          var clientL = clientRect.left;
          var clientR = clientRect.right;

          if( !(x2 < clientL || clientR < x1) && !(y2 < clientT || clientB < y1)){
             $(this).addClass("multiSelectedPattern");
          }
      });
    }

  });

  document.addEventListener('mouseup', () => {
     isDragging = false;
     isResizingR = false;
     isResizingL = false;
     isDraggingTitle = false;

     // SNAPPING PATTERNS
     if(activePattern != null){
        $(".multiSelectedPattern").each(function(){
          var pos = Math.round(parseInt(this.style.marginLeft) / BEAT_WIDTH);
          $(this).attr('data-pos',pos);
          this.style.marginLeft = (pos * BEAT_WIDTH) + "px";

          var length = Math.round(parseInt(this.style.width) / BEAT_WIDTH);
          alert(this.style.width);
          alert(parseInt(this.style.width));
          $(this).attr('data-length',length);
          this.style.width = (length * BEAT_WIDTH) + "px";
        });
     }

     if(activeTrack != null){
        $(activeTrack).removeClass("selected");
         var id = $(activeTrack).attr("data-id");
         $("#track_"+id).removeClass("selected");
     }

     $('track-title').each(function(){
          $(this).removeClass("insertMarkB");
          $(this).removeClass("insertMarkT");
     });

     if(activeInsertSlot != null){
        var id = $(activeTrack).attr("data-id");
        var idSlot = $(activeInsertSlot).attr("data-id");
        if(activeInsertPos == "top"){
           $(activeTrack).insertBefore($(activeInsertSlot));
           $("#track_"+id).insertBefore($("#track_"+idSlot));
        }else if(activeInsertPos == "bot"){
           $(activeTrack).insertAfter($(activeInsertSlot));
           $("#track_"+id).insertAfter($("#track_"+idSlot));
        }
     }

     activePattern = null;
     activeTrack = null;
     activeInsertSlot = null;
     activeInsertPosition = null;

     isSelectingPatterns = false;
     selectionArea.css("display", "none");
  });

  var tracks_height_sum = 0;
  var tracks_row_length = 0;

  class BeatCol extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");

      var bar = $(this).attr('data-bar');
      var beat = $(this).attr('data-beat');
      if(beat == 1){
        $(this).addClass("fullbar");
      }
      if(bar % 2 == 0){
        $(this).addClass("col_b");
      }else{
        $(this).addClass("col_a");
      }
      var beat_marker = $('<span>').text(bar+"."+beat);
      if(beat!=1){
         beat_marker.addClass("extended_beat_marker");
      }
      $(this).append(beat_marker); 
      tracks_row_length += 20; //+2 Because of border
    }
  }

  class BeatBar extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      for(var bar = 1; bar<=300; bar++){
         for(var beat = 1; beat<=4; beat++){
             $(this).append($("<beat-col>").attr('data-bar', bar).attr('data-beat', beat));
         }
      }
    }
  }

  function resizePatterns(){
    $("track-pattern").each(function(){
      var pos = $(this).attr('data-pos');
      this.style.marginLeft = (pos * BEAT_WIDTH) + "px";
      var length = $(this).attr('data-length');
      this.style.width = (length * BEAT_WIDTH) + "px"; 
    });
  }

  class BeatBarHeader extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      var zoom_in = $("<div id='zoom_in_grid'>+</div>");
      zoom_in.on("click",function(){
         BEAT_WIDTH = parseInt($("#root").css("--beat-width"));
         BEAT_WIDTH += 5;
         if(BEAT_WIDTH >= 30){ BEAT_WIDTH = 30; }
         if(BEAT_WIDTH > 15){ $(".extended_beat_marker").css("display","block"); }
         $("#root")[0].style.setProperty("--beat-width", BEAT_WIDTH+"px");
         resizePatterns();
      });

      var zoom_out = $("<div id='zoom_out_grid'>-</div>");
      zoom_out.on("click",function(){
         BEAT_WIDTH = parseInt($("#root").css("--beat-width"));
         BEAT_WIDTH -= 5;
         if(BEAT_WIDTH <= 5){ BEAT_WIDTH = 5; }
         if(BEAT_WIDTH <= 15){ $(".extended_beat_marker").css("display","none"); }
         $("#root")[0].style.setProperty("--beat-width", BEAT_WIDTH+"px");
         resizePatterns();
      });

      $(this).append(zoom_in);
      $(this).append(zoom_out);
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









  class TrackPatternBl extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.addEventListener('mousedown', (event) => {
         event.stopPropagation();
         isResizingL = true;
         activePattern = $(this).parent()[0];
      });
    }
  }

  class TrackPatternBr extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.addEventListener('mousedown', (event) => {
         event.stopPropagation();
         isResizingR = true;
         activePattern = $(this).parent()[0];
      });
    }
  }

  class TrackPattern extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.initialized) {
        this.addEventListener('mousedown', (event) => {
          event.stopPropagation();
          isDragging = true;
          activePattern = this;
          activePattern_oldmargin = this.getBoundingClientRect().left + $("beat-bar").scrollLeft() - ROOT_PADDING;
          const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;
          xOffsetOnPattern = x - activePattern_oldmargin;
        });

        $(this).append($('<track-pattern-bl>'));
        $(this).append($('<track-pattern-br>'));
        this.initialized = true;
      }
    }
  }

  class TrackRowEmpty extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.initialized) {
        $(this).addClass("unselectable");
        $(this).append("<span>Create New Track</span>");

        $(this).on("click",function(){
           var color = "hsl(0,0%,85%)";
           var tt = $("<track-title text='Track #"+trackID+"'>").css("background-color",color).attr("data-id",trackID);
           $("track-title-container").append(tt);
           var tr = $("<track-row>").attr('data-stdcolor',color).attr('id','track_'+trackID);
           $("track-row-container").append(tr);
           trackID++;

           $("track-window").scrollTop($("track-window")[0].scrollHeight);
           $("track-title-container").scrollTop($("track-title-container")[0].scrollHeight);
        });

        this.initialized = true;
      }
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

        $(this).dblclick(function(event) {
           const x = event.clientX + $("beat-bar").scrollLeft() - ROOT_PADDING;

           var beatpos = Math.floor(x / BEAT_WIDTH);
           var newmargin = (beatpos * BEAT_WIDTH); //Snap to Grid
           var newpat = $('<track-pattern>');
           newpat.attr('data-pos',beatpos);
           newpat.attr('data-length',4);
           newpat.css("margin-left",newmargin+"px");
           newpat.css("background-color",$(this).attr('data-stdcolor'));

           $(this).append(newpat);
        });

        $(this).on('mousedown', (event) => {
          if(!isSelectingPatterns){
           $("track-pattern").each(function(){
             $(this).removeClass("multiSelectedPattern");
           });
           isSelectingPatterns = true;
           selectRootX = event.clientX;
           selectRootY = event.clientY;
          }
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
      $(this).append($("<track-row-container>"));
      $(this).append($("<track-row-empty>"));
    }
  }



  class GridWindow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).append($("<beat-bar-container>"));
      $(this).append($("<track-window>"));
    }
  }










  class TrackTitle extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
      this.text = this.getAttribute('text') || '';
    }

    connectedCallback() {
      if (!this.initialized) {
        $(this).addClass("unselectable");
        //$(this).prop("draggable",true);
        var input = $("<input/>");
        input.addClass("unselectable");
        input.val(this.text);
        $(this).append(input);

        this.addEventListener('mousedown', (event) => {
           event.stopPropagation();

           activeTrack = this;
           $(activeTrack).addClass("selected");
           var id = $(activeTrack).attr("data-id");
           $("#track_"+id).addClass("selected");

           isDraggingTitle = true;
        });

        this.addEventListener('dblclick', (event) => {
           event.stopPropagation();
           
           input.data('disabled', true);
           input.focus();

           activeTrack = null;
           isDraggingTitle = false;
        });

        input.on("mousedown", function(event){
           event.preventDefault();
           input.data('disabled', true);
           input.blur();
        });

        input.on('keypress',function(e) {
           if(e.which == 13) {
              input.data('disabled', true);
              input.blur();
           }
        });

        input.on({ 
          focus: function() { if (!$(this).data('disabled')) this.blur() },
          //dblclick: function() { $(this).data('disabled', true); this.focus() },
          blur: function() { $(this).data('disabled', false); } 
        });



        $(this).on("contextmenu", function (event) {
          event.preventDefault();
          var posX = event.clientX;
          var posY = event.clientY;
          contextMenu.css("display", "block");
          contextMenu.css("left", posX-100 + "px");
          contextMenu.css("top", posY + "px");
          focusTrack = this;
        });


        this.initialized = true;
      }

    }
  }

  var trackID = 0;
  class TrackTitleContainer extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.initialized) {

        

        $(this).addClass("unselectable");
        for(var i = 1; i<10; i++){
           var color = "hsl(0,0%,85%)";
           var tt = $("<track-title text='Track #"+trackID+"'>").css("background-color",color).attr("data-id",trackID);
           $(this).append(tt);
           var tr = $("<track-row>").attr('data-stdcolor',color).attr('id','track_'+trackID);
           $("track-row-container").append(tr);
           trackID++;
        }

        this.initialized = true;
      }
    }
  }


  class TrackTitleHeader extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.initialized) {
      }
    }
  }


  class TrackTitleFooter extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.initialized) {
      }
    }
  }

  class SideWindow extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      $(this).addClass("unselectable");
      $(this).append("<track-title-header>");
      $(this).append("<track-title-container>");
      $(this).append("<track-title-footer>");
    }
  }






$(document).ready(function(){

  // Define the custom element
  customElements.define('beat-col'    , BeatCol);
  customElements.define('beat-bar'    , BeatBar);
  customElements.define('beat-bar-header' , BeatBarHeader);
  customElements.define('beat-bar-container'    , BeatBarContainer);

  customElements.define('track-pattern-bl' , TrackPatternBl);
  customElements.define('track-pattern-br' , TrackPatternBr);
  customElements.define('track-pattern' , TrackPattern);
  customElements.define('track-row'   , TrackRow);
  customElements.define('track-row-empty'   , TrackRowEmpty);
  customElements.define('track-row-container'  , TrackRowContainer);
  customElements.define('track-window', TrackWindow);

  customElements.define('grid-window' , GridWindow);

  customElements.define('track-title' , TrackTitle);
  customElements.define('track-title-container', TrackTitleContainer);
  customElements.define('track-title-header', TrackTitleHeader);
  customElements.define('track-title-footer', TrackTitleFooter);
  customElements.define('side-window' , SideWindow);

  $("#root").append($("<grid-window>"));
  $("#root").append($("<side-window>"));

  $("beat-bar").scrollLeft(0);
  $("#root").bind('wheel', function(e) {
       $("track-window").scrollTop(e.originalEvent.deltaY + $("track-window").scrollTop());
       $("track-title-container").scrollTop(e.originalEvent.deltaY + $("track-title-container").scrollTop());

       $("beat-bar").scrollLeft(e.originalEvent.deltaX + $("beat-bar").scrollLeft());
       $("track-window").scrollLeft($("beat-bar").scrollLeft());
  });

});