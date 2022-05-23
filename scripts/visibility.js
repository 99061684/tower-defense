function toggleContent(selector){
  if(!selector) return;
  // Hide active element
  const activeWrapper = document.querySelector(".wrapper.active");
  if(activeWrapper) activeWrapper.classList.remove('active');
  
  // Show new active element
  const currentWrapper = document.querySelector(selector);
  if(currentWrapper) {
    currentWrapper.classList.add("active");
  }
  // console.log(currentWrapper);
}

function toggleTriggered(evt){
  // Find the anchor that was clicked
  const anchor = evt.target.closest("a");
  if(!anchor) return;

  // Get the data attribute
  const toggles = anchor.dataset.toggles;
  
  // Show content
  toggleContent(toggles);
}

// Add a single click listener
document.body.addEventListener("click", toggleTriggered);

// Set default state
toggleContent('#index');
