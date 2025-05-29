/**
 * Logout Module
 * 
 * Handles user logout functionality with confirmation modal
 * Uses our custom authentication system (not Firebase Auth)
 */

const logoutBtn = document.querySelector('.logout-button');
logoutBtn.addEventListener('click', () => {
    // Prevent duplicate modals
    if (document.querySelector('.logout-modal')) return;
  
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    document.body.appendChild(overlay);
  
    const modal = document.createElement('div');
    modal.classList.add('logout-modal');
    modal.innerHTML = `
      <div class="logout-icon-container">
        <img src="/asset/icons/qmark-icon.png" alt="Question Icon">
      </div>
      <p class="confirm-text">CONFIRM LOGOUT</p>
      <p class="confirmation-text">Are you sure you want to exit the application?</p>
      <div class="confirm-button-container">
        <button class="confirmed-btn">Yes, Log me out!</button>
        <button class="declined-btn">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);
  
    modal.querySelector('.declined-btn').addEventListener('click', () => {
      modal.remove();
      overlay.remove();
    });
    modal.querySelector('.confirmed-btn').addEventListener('click', () => {
      // Display logout animation
      const loadingOverlay = document.createElement('div');
      loadingOverlay.classList.add('loading-overlay');
      loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Logging out...</p>
      `;
      document.body.appendChild(loadingOverlay);
      
      // Sign out the user with custom auth
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_email');
      sessionStorage.removeItem('user_role');
      sessionStorage.removeItem('currentUser');
      
      // Short delay for user experience
      setTimeout(() => {
        // Redirect to login page after successful logout
        console.log("User logged out successfully");
        window.location.href = '/index.htm';
      }, 800);
    });
  });
  