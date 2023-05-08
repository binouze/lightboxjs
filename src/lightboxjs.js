/**
 * Create a lightbox from a link element or any other element with a data-url attribute
 * @param elem
 * @constructor
 */
let LightboxJS = function( elem )
{
    // initialize if not already done
    if( !LightboxJS.isInit )
    {
        LightboxJS.init();
        LightboxJS.isInit = true;
    }

    this.trigger  = elem;
    this.href     = elem.getAttribute('href') ?? elem.dataset.url ?? null;
    this.width    = elem.dataset.width  ?? 1000;
    this.height   = elem.dataset.height ?? 600;

    const closeWithOverlayData = (elem.dataset.closeWithOverlay ?? 1);
    this.closeWithOverlay = closeWithOverlayData !== 0 && closeWithOverlayData !== '0' && closeWithOverlayData !== 'false';

    const showBtnCloseData = (elem.dataset.showBtnClose ?? 1);
    this.showBtnClose = showBtnCloseData !== 0 && showBtnCloseData !== '0' && showBtnCloseData !== 'false';

    if( this.href != null )
    {
        const _this = this;

        // catch click events to start opening links in iframes
        this.trigger.addEventListener('click', (e) =>
        {
            e.preventDefault();
            _this.open();
        });
    }
    else
    {
        console.error('[LightboxJS] this element does not contains url information');
    }

    LightboxJS.current = this;
};

/**
 * Create the lighbox elements
 */
LightboxJS.init = function ()
{
    LightboxJS.el       = document.createElement('div');
    LightboxJS.content  = document.createElement('div');
    LightboxJS.body     = document.createElement('div');
    LightboxJS.spinner  = document.createElement('div');
    LightboxJS.overlay  = document.createElement('div');
    LightboxJS.closebtn = document.createElement('div');
    LightboxJS.frame    = document.createElement('iframe');

    LightboxJS.closebtn.innerHTML = "&times;";

    LightboxJS.el.classList.add('lightboxjs');
    LightboxJS.overlay.classList.add('ljs-overlay');
    LightboxJS.spinner.classList.add('ljs-spinner');
    LightboxJS.content.classList.add('ljs-content');
    LightboxJS.closebtn.classList.add('ljs-close');
    LightboxJS.body.classList.add('ljs-body');

    LightboxJS.el.appendChild(this.overlay);
    LightboxJS.el.appendChild(this.closebtn);
    LightboxJS.el.appendChild(this.spinner);
    LightboxJS.content.appendChild(this.body);
    LightboxJS.el.appendChild(this.content);
    LightboxJS.body.append(this.frame);
    document.body.appendChild(this.el);

    LightboxJS.frame.onload = () =>
    {
        if( !LightboxJS.isOpen() )
            return;

        LightboxJS.spinner.classList.remove('ljs-show');
        LightboxJS.content.classList.add('ljs-loaded');

        // afficher le bouton close si necessaire
        if( LightboxJS.current.showBtnClose )
        {
            LightboxJS.closebtn.classList.add('ljs-show');
            LightboxJS.closebtn.classList.add('ljs-open');
        }

        const ff = () =>
        {
            LightboxJS.closebtn.classList.remove('ljs-show');

            LightboxJS.closebtn.removeEventListener('webkitAnimationEnd', ff, false);
            LightboxJS.closebtn.removeEventListener('mozAnimationEnd',    ff, false);
            LightboxJS.closebtn.removeEventListener('msAnimationEnd',     ff, false);
            LightboxJS.closebtn.removeEventListener('animationend',       ff, false);
        }

        LightboxJS.closebtn.addEventListener('webkitAnimationEnd', ff, false);
        LightboxJS.closebtn.addEventListener('mozAnimationEnd',    ff, false);
        LightboxJS.closebtn.addEventListener('msAnimationEnd',     ff, false);
        LightboxJS.closebtn.addEventListener('animationend',       ff, false);
    };

    const closeWithOverlay = () =>
    {
        if( LightboxJS.current.closeWithOverlay )
            LightboxJS.close();
    }

    const closeWithBtn = () =>
    {
        LightboxJS.close();
    }

    const f = () =>
    {
        if( LightboxJS.isOpen() )
            return;

        LightboxJS.frame.src = 'about:blank';
        LightboxJS.el.classList.remove('ljs-show');
        LightboxJS.closebtn.classList.remove('ljs-show');
        LightboxJS.closebtn.classList.remove('ljs-open');
    };

    LightboxJS.overlay.addEventListener('click',  closeWithOverlay );
    LightboxJS.closebtn.addEventListener('click', closeWithBtn );

    // listen for lightboxjs-close-me messages
    window.addEventListener( "message", (event) =>
        {
            if( event.data === "lightboxjs-close-me" )
                LightboxJS.close();
        },
        false
    );

    this.el.addEventListener('transitionend',       f, false);
    this.el.addEventListener('webkitTransitionEnd', f, false);
    this.el.addEventListener('mozTransitionEnd',    f, false);
    this.el.addEventListener('msTransitionEnd',     f, false);
};

/**
 * Load the url in the iframe
 */
LightboxJS.loadIframe = function (href)
{
    // show the spinner
    LightboxJS.spinner.classList.add('ljs-show');
    // hide the content until the url is loaded
    LightboxJS.content.classList.remove('ljs-loaded');
    // hide the close button until loaded
    LightboxJS.closebtn.classList.remove('ljs-show');
    LightboxJS.closebtn.classList.remove('ljs-open');
    // set the iframe url
    LightboxJS.frame.src = href;
};

/**
 * Open the lightbox
 */
LightboxJS.prototype.open = function ()
{
    // be sure the frame has the right dimensions
    LightboxJS.setDimensions( this.width, this.height );
    // start loading url
    LightboxJS.loadIframe(this.href);

    // show the lightbox parent element
    LightboxJS.el.classList.add('ljs-show');
    LightboxJS.el.offsetHeight; // without this, the css transition don't work
    LightboxJS.el.classList.add('ljs-open');

    // update the class of the overlay to show or not the clickable pointer
    if( !this.closeWithOverlay )
        LightboxJS.overlay.classList.remove('ljs-clickable');
    else
        LightboxJS.overlay.classList.add('ljs-clickable');

    // enregistrer l'instance en cours d'ouverture
    LightboxJS.current = this;
};

/**
 * Close the lightbox
 */
LightboxJS.close = function ()
{
    // hide the lightbox parent element
    // this starts the hide transition
    LightboxJS.el.classList.remove('ljs-open');
}

LightboxJS.isOpen = function ()
{
    // true if the lightbox is open
    return LightboxJS.el.classList.contains('ljs-open');
};

// define the with and height of the iframe
LightboxJS.setDimensions = function (w, h)
{
    //this.width  = w;
    //this.height = h;
    LightboxJS.content.style.width  = w + 'px';
    LightboxJS.content.style.height = h + 'px';
};


// on document is loaded, transform elements with lightboxjs-link class into lighboxjs elements
document.addEventListener("DOMContentLoaded", () =>
{
    document.querySelectorAll('.lightboxjs-link').forEach( (el) =>
    {
        el.lightbox = new LightboxJS(el);
    });
});