const Preact = require('preact');

// const elementAustralia = document.querySelector('[data-solar-eclipse-root]');
const elemNameAustralia = document.querySelector('[name=australiamap]');
const elementWorld = document.querySelector('[name=worldmap]');

const init = () => {
    render(elemNameAustralia, "australia");
    render(elementWorld, "world");
}


let render = (element, type) => {
    let App = require('./components/app');
    Preact.render(<App type={type}/>, element, element.lastChild);
};

// Do some hot reload magic with errors
if (process.env.NODE_ENV !== 'production' && module.hot) {
    // Wrap the actual renderer in an error trap
    let renderFunction = render;
    render = (element, type) => {
        try {
            renderFunction(element, type);
        } catch (e) {
            // Render the error to the screen in place of the actual app
            const ErrorBox = require('./error-box');
            root = Preact.render(<ErrorBox error={e} />, element, root);
        }
    };

    // If a new app build is detected try rendering it
    module.hot.accept('./components/app', () => {
        setTimeout(init);
    });
}

// Load when Odyssey is ready
if (window.__ODYSSEY__) {
    init();
} else {
    window.addEventListener('odyssey:api', () => {
        init();
    });
}


// render();