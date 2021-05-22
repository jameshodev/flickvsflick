const createAutoComplete = ({
  root,
  renderOption,
  onOptionSelect,
  inputValue,
  fetchData,
}) => {
  root.innerHTML = `
    <label><b>Search</b></label>
    <input placeholder="ex: toy story, forrest gump, etc. " class="input" />
    <div class="dropdown">
      <div class="dropdown-menu">
        <div class="dropdown-content results">
        </div>
      </div>
    </div>
  `;

  const input = root.querySelector('input');
  // Selector to display list of items from dropdown
  const dropdown = root.querySelector('.dropdown');
  // Selector to display the selected item on the page
  const resultsWrapper = root.querySelector('.results');

  //********* 2. Retreive Data & Display Items List *******
  const onInput = async (event) => {
    // Fetch the data
    const items = await fetchData(event.target.value);

    // If no item, remove dropdown and exit
    if (items.length === 0) {
      dropdown.classList.remove('is-active');
      return;
    }

    // Clear out previous suggested results
    resultsWrapper.innerHTML = '';
    // Assign class to open the dropdown menu
    dropdown.classList.add('is-active');

    for (let item of items) {
      // Display a list of item options
      const option = document.createElement('a');

      option.classList.add('dropdown-item');
      option.innerHTML = renderOption(item);
      //********* 3. Listen to a click on one of the items *********
      option.addEventListener('click', () => {
        dropdown.classList.remove('is-active');
        input.value = inputValue(item);
        onOptionSelect(item);
      });
      // add the created div to the page
      resultsWrapper.appendChild(option);
    }
  };

  //********* 1. Listen to the input, pass input to onInput after 1s *********
  input.addEventListener('input', debounce(onInput, 1000));

  // Remove dropdown menu if click outside of the list
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) {
      dropdown.classList.remove('is-active');
    }
  });
};
