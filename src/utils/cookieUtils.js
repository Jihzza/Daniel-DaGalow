// src/utils/cookieUtils.js (Create this new file)

/**
 * Sets a cookie in the browser.
 * @param {string} name The name of the cookie.
 * @param {string} value The value of the cookie.
 * @param {number} daysToExpire Optional number of days until the cookie expires.
 * @param {string} path Optional URL path scope (default: '/').
 */
export function setCookie(name, value, daysToExpire, path = '/') {
    let expires = "";
    if (daysToExpire) {
      const date = new Date();
      date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    // Always add Secure and SameSite=Lax for better security
    // In development (non-HTTPS), 'Secure' might prevent the cookie from being set.
    // Consider adding a check for development environment if needed.
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + "=" + (value || "") + expires + "; path=" + path + secureFlag + "; SameSite=Lax";
    console.log(`Cookie set: <span class="math-inline">\{name\}\=</span>{value}`); // For debugging
  }
  
  /**
   * Gets a cookie value by name.
   * @param {string} name The name of the cookie.
   * @returns {string|null} The cookie value or null if not found.
   */
  export function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  
  /**
   * Deletes a cookie by name.
   * @param {string} name The name of the cookie.
   * @param {string} path Optional URL path scope (default: '/').
   */
  export function deleteCookie(name, path = '/') {
    // Set expiry date to the past
    document.cookie = name + '=; Max-Age=-99999999; path=' + path;
    console.log(`Cookie deleted: ${name}`); // For debugging
  }