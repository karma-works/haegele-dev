/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html } from 'lit-element';
import { PageViewElement } from './page-view-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

class AboutMeView extends PageViewElement {
  static get styles() {
    return [
      SharedStyles
    ];
  }

  render() {
    return html`
      <section>
        <h2>Welcome to Haegele's Development Show Cases</h2>
        <p>My name is Christian Hägele, I'm a professional Web Developer.</p>
        <p>On this page I collect interesting uses cases for web technologies.</p>
      </section>
      <section>
        <h2>About Myself</h2>
        <p>I am a T-Shaped Java Developer with strong technical background, experience in agile development methodology and, requirements engineering, supplemented by industry knowledge in banks and insurance. Since 2009 I am in the field of IT Consultant Financial Services and a wide variety of project experience. Core Bank Migration with Offshore Development, Software renewal of insurance software, software extensions of Standard software as well as individual development.</p>
      </section>
      <section>
      <h2>Contact</h2>
      <p>For recruitment requests or questions regarding the show cases, please feel free to <a href="mailto:christian@haegele.dev">contact me</a> at any time.</p>
</section>
     
    `;
  }
}

window.customElements.define('about-me-view', AboutMeView);
