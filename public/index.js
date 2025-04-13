const fileInput = document.getElementById('fileInput');
const browseLink = document.getElementById('browseLink');
const fileNameDisplay = document.createElement('p');
fileNameDisplay.id = 'file-name';
fileInput.parentNode.insertBefore(fileNameDisplay, fileInput.nextSibling);

browseLink.addEventListener('click', ()=>{
  fileInput.click();
});

fileInput.addEventListener('change', function () {
  if (fileInput.files.length > 0) {
    fileNameDisplay.textContent = `Selected File: ${fileInput.files[0].name}`;
  } else {
    fileNameDisplay.textContent = '';
  }
});
console.log(fileNameDisplay);