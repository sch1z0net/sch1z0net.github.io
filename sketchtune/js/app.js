
class GridWindow extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
  }

  connectedCallback() {
        // Add any initial setup logic here
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
