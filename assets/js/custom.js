(function () {
  const form = document.getElementById('cv-contact-form');
  if (!form) return;

  const siustiBtn = document.getElementById('siusti-btn');
  const isvalytiBtn = document.getElementById('isvalyti-btn');
  const resultBox = document.getElementById('form-result');
  const averageBox = document.getElementById('form-average');

  const fields = {
    vardas: document.getElementById('vardas'),
    pavarde: document.getElementById('pavarde'),
    email: document.getElementById('email'),
    telefonas: document.getElementById('telefonas'),
    adresas: document.getElementById('adresas'),
    vertinimas1: document.getElementById('vertinimas1'),
    vertinimas2: document.getElementById('vertinimas2'),
    vertinimas3: document.getElementById('vertinimas3')
  };

  const lettersOnly = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s-]+$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(name, message) {
    const input = fields[name];
    const errorEl = form.querySelector('[data-error-for="' + name + '"]');
    if (!input || !errorEl) return false;
    if (message) {
      input.classList.add('is-invalid');
      errorEl.textContent = message;
      return false;
    }
    input.classList.remove('is-invalid');
    errorEl.textContent = '';
    return true;
  }

  function validateField(name) {
    const value = (fields[name].value || '').trim();

    if (name === 'vardas' || name === 'pavarde') {
      if (!value) return setError(name, 'Laukas privalomas.');
      if (!lettersOnly.test(value)) return setError(name, 'Leidžiamos tik raidės.');
      return setError(name, '');
    }

    if (name === 'email') {
      if (!value) return setError(name, 'Laukas privalomas.');
      if (!emailPattern.test(value)) return setError(name, 'Neteisingas el. pašto formatas.');
      return setError(name, '');
    }

    if (name === 'adresas') {
      if (!value) return setError(name, 'Laukas privalomas.');
      return setError(name, '');
    }

    if (name === 'telefonas') {
      const digits = value.replace(/\D/g, '');
      if (!value) return setError(name, 'Laukas privalomas.');
      if (digits.length !== 11 || !digits.startsWith('3706')) {
        return setError(name, 'Formatas: +370 6xx xxxxx');
      }
      return setError(name, '');
    }

    if (name.indexOf('vertinimas') === 0) {
      const n = Number(fields[name].value);
      if (!n || n < 1 || n > 10) return setError(name, 'Reikšmė turi būti nuo 1 iki 10.');
      return setError(name, '');
    }

    return true;
  }

  function formatPhone(raw) {
    let digits = String(raw).replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '370' + digits.slice(1);
    if (digits.startsWith('0')) digits = '370' + digits.slice(1);
    if (!digits.startsWith('370') && digits.length > 0) digits = '370' + digits;
    digits = digits.slice(0, 11);

    let out = '';
    if (digits.length > 0) out = '+' + digits.slice(0, 3);
    if (digits.length > 3) out += ' ' + digits.slice(3, 6);
    if (digits.length > 6) out += ' ' + digits.slice(6, 11);
    return out;
  }

  function updateRangeOutputs() {
    ['vertinimas1', 'vertinimas2', 'vertinimas3'].forEach(function (name) {
      const out = document.getElementById(name + '-out');
      if (out) out.textContent = fields[name].value;
    });
  }

  function formIsValid() {
    return Object.keys(fields).every(function (name) {
      return validateField(name);
    });
  }

  function updateSubmitState() {
    const filled =
      fields.vardas.value.trim() &&
      fields.pavarde.value.trim() &&
      fields.email.value.trim() &&
      fields.telefonas.value.trim() &&
      fields.adresas.value.trim() &&
      fields.vertinimas1.value &&
      fields.vertinimas2.value &&
      fields.vertinimas3.value;

    const noErrors = Object.keys(fields).every(function (name) {
      const err = form.querySelector('[data-error-for="' + name + '"]');
      return err && err.textContent === '' && !fields[name].classList.contains('is-invalid');
    });

    // Keep button disabled unless filled AND currently valid (after user interaction)
    const touched = form.dataset.touched === '1';
    siustiBtn.disabled = !(filled && (!touched || noErrors));
    if (touched) {
      siustiBtn.disabled = !formIsValid();
    } else {
      siustiBtn.disabled = !filled;
    }
  }

  Object.keys(fields).forEach(function (name) {
    const el = fields[name];
    el.addEventListener('input', function () {
      form.dataset.touched = '1';
      if (name === 'telefonas') {
        const start = el.selectionStart;
        el.value = formatPhone(el.value);
      }
      if (name.indexOf('vertinimas') === 0) updateRangeOutputs();
      validateField(name);
      updateSubmitState();
    });
    el.addEventListener('blur', function () {
      form.dataset.touched = '1';
      validateField(name);
      updateSubmitState();
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    form.dataset.touched = '1';
    if (!formIsValid()) {
      updateSubmitState();
      return;
    }

    const data = {
      vardas: fields.vardas.value.trim(),
      pavarde: fields.pavarde.value.trim(),
      email: fields.email.value.trim(),
      telefonas: fields.telefonas.value.trim(),
      adresas: fields.adresas.value.trim(),
      vertinimas1: Number(fields.vertinimas1.value),
      vertinimas2: Number(fields.vertinimas2.value),
      vertinimas3: Number(fields.vertinimas3.value)
    };

    console.log(data);

    const vidurkis = (
      (data.vertinimas1 + data.vertinimas2 + data.vertinimas3) / 3
    ).toFixed(2);

    resultBox.classList.remove('d-none');
    resultBox.innerHTML =
      '<p><strong>Vardas:</strong> ' + data.vardas + '</p>' +
      '<p><strong>Pavardė:</strong> ' + data.pavarde + '</p>' +
      '<p><strong>El. paštas:</strong> ' + data.email + '</p>' +
      '<p><strong>Tel. numeris:</strong> ' + data.telefonas + '</p>' +
      '<p><strong>Adresas:</strong> ' + data.adresas + '</p>' +
      '<p><strong>Svetainės aiškumas:</strong> ' + data.vertinimas1 + '</p>' +
      '<p><strong>Turinio naudingumas:</strong> ' + data.vertinimas2 + '</p>' +
      '<p><strong>Dizaino kokybė:</strong> ' + data.vertinimas3 + '</p>';

    averageBox.classList.remove('d-none');
    averageBox.textContent = data.vardas + ' ' + data.pavarde + ': ' + vidurkis;
  });

  isvalytiBtn.addEventListener('click', function () {
    form.reset();
    form.dataset.touched = '';
    Object.keys(fields).forEach(function (name) {
      fields[name].classList.remove('is-invalid');
      const err = form.querySelector('[data-error-for="' + name + '"]');
      if (err) err.textContent = '';
    });
    fields.vertinimas1.value = 5;
    fields.vertinimas2.value = 5;
    fields.vertinimas3.value = 5;
    updateRangeOutputs();
    resultBox.classList.add('d-none');
    resultBox.innerHTML = '';
    averageBox.classList.add('d-none');
    averageBox.textContent = '';
    siustiBtn.disabled = true;
  });

  updateRangeOutputs();
  updateSubmitState();
})();
