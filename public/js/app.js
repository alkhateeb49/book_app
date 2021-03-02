'use strict';
function update(){
  event.preventDefault();
  if (document.getElementById('updatediv').style['display'] === 'none') {
    document.getElementById('updatediv').style['display'] = 'flex';
  } else if (document.getElementById('updatediv').style['display'] === 'flex') {
    document.getElementById('updatediv').style['display'] = 'none';
  }
}
