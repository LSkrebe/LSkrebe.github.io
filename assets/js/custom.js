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

  function getError(name) {
    const value = (fields[name].value || '').trim();

    if (name === 'vardas' || name === 'pavarde') {
      if (!value) return 'Laukas privalomas.';
      if (!lettersOnly.test(value)) return 'Leidžiamos tik raidės.';
      return '';
    }

    if (name === 'email') {
      if (!value) return 'Laukas privalomas.';
      if (!emailPattern.test(value)) return 'Neteisingas el. pašto formatas.';
      return '';
    }

    if (name === 'adresas') {
      if (!value) return 'Laukas privalomas.';
      return '';
    }

    if (name === 'telefonas') {
      const digits = value.replace(/\D/g, '');
      if (!value) return 'Laukas privalomas.';
      if (digits.length !== 11 || !digits.startsWith('3706')) {
        return 'Formatas: +370 6xx xxxxx';
      }
      return '';
    }

    if (name.indexOf('vertinimas') === 0) {
      const n = Number(fields[name].value);
      if (!n || n < 1 || n > 10) return 'Reikšmė turi būti nuo 1 iki 10.';
      return '';
    }

    return '';
  }

  function validateField(name, show) {
    const message = getError(name);
    if (show) setError(name, message);
    return message === '';
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
      return validateField(name, false);
    });
  }

  function updateSubmitState() {
    siustiBtn.disabled = !formIsValid();
  }

  Object.keys(fields).forEach(function (name) {
    const el = fields[name];
    el.addEventListener('input', function () {
      if (name === 'telefonas') {
        el.value = formatPhone(el.value);
      }
      if (name.indexOf('vertinimas') === 0) updateRangeOutputs();
      validateField(name, true);
      updateSubmitState();
    });
    el.addEventListener('blur', function () {
      validateField(name, true);
      updateSubmitState();
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    Object.keys(fields).forEach(function (name) {
      validateField(name, true);
    });
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
    Object.keys(fields).forEach(function (name) {
      setError(name, '');
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
  siustiBtn.disabled = true;
})();
