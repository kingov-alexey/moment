import playList from './playList.js';

// ^ ELEMENTS
const time = document.querySelector('.time');
const dateNow = document.querySelector('.date');
const greeting = document.querySelector('.greeting');
const name = document.querySelector('.name');
const body = document.querySelector('body');
const slideNext = document.querySelector('.slide-next');
const slidePrev = document.querySelector('.slide-prev');
const weatherIcon = document.querySelector('.weather-icon');
const temperature = document.querySelector('.temperature');
const weatherDescription = document.querySelector('.weather-description');
const city = document.querySelector('.city');
const wind = document.querySelector('.wind');
const humidity = document.querySelector('.humidity');
const weatherError = document.querySelector('.weather-error');
const changeQuote = document.querySelector('.change-quote');
const quote = document.querySelector('.quote');
const author = document.querySelector('.author');

// ^ GLOBAL VARIABLE
let randomNum;

// ^ FUNCTION
// *** рекурсивная функция которая отображает время, а также обновляет дату и приветсвие
function showTime() {
  const date = new Date();
  const currentTime = date.toLocaleTimeString();
  time.textContent = `${currentTime}`;
  showDate();
  showGreeting();
  setTimeout(showTime, 1000);
}

// *** функция, которая отображает дату внутри указанного элемента
function showDate() {
  const date = new Date();
  const options = {
    weekday: 'long',
    //year: 'numeric',
    day: 'numeric',
    month: 'long',
    //month: 'long',
    //day: 'numeric',
    //hour: 'numeric',
    //minute: 'numeric',
    //timeZone: 'UTC',
  };
  const currentDate = date.toLocaleDateString('en-US', options);
  //console.log(currentDate);
  dateNow.textContent = `${currentDate}`;
}

// *** функция, которая отображает приветствие внутри указанного элемента
function showGreeting() {
  const timeOfDay = getTimeOfDay();
  const greetingText = `Good ${timeOfDay}`;
  greeting.textContent = greetingText;
}

// *** функция, которая получает время суток morning, afternoon, evening, night
function getTimeOfDay() {
  const date = new Date();
  const hours = date.getHours();
  const timeOfDay = ['morning', 'afternoon', 'evening', 'night'];
  const nowTimeOfDay = Math.trunc(hours / 6 - 1);
  if (nowTimeOfDay < 0) {
    return timeOfDay[3];
  } else {
    return timeOfDay[nowTimeOfDay];
  }
}

// *** функция, которая устанавливает фоновое изображение. (Ссылка на фоновое изображение формируется с учётом времени суток и передаваемого номера изображения. Если номер не передается то берется рандомный
function setBg(numImage) {
  const timeOfDay = getTimeOfDay();
  let bgNum;

  if (numImage == undefined) {
    bgNum = getRandomNum();
    randomNum = bgNum;
  } else {
    bgNum = randomNum;
  }

  bgNum = bgNum.toString().padStart(2, '0');
  const backgroundImageUrl = `https://raw.githubusercontent.com/kingov-alexey/stage1-tasks/assets/images/${timeOfDay}/${bgNum}.jpg`;

  const img = new Image();
  img.src = backgroundImageUrl;
  img.addEventListener('load', () => {
    body.style.backgroundImage = `url('${backgroundImageUrl}')`;
  });
}

// *** функция которая инкрементирует/увеличивает номер текущего фонового изображения
slideNext.addEventListener('click', getSlideNext);
function getSlideNext() {
  randomNum++;
  if (randomNum > 20) {
    randomNum = 1;
  }
  setBg(randomNum);
}

// *** функция которая декрементирует/уменьшает номер текущего фонового изображения
slidePrev.addEventListener('click', getSlidePrev);
function getSlidePrev() {
  randomNum--;
  if (randomNum < 1) {
    randomNum = 20;
  }
  setBg(randomNum);
}

// *** Виджет погоды на API
async function getWeather() {
  localStorage.setItem('city', city.value);
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.value}&lang=en&appid=f9ab01b0dfcf8a7d2fc073682c9f909a&units=metric`;
  const res = await fetch(url);
  const data = await res.json();

  if (res.status !== 200) {
    weatherError.textContent = `Error: ${data.message}`;
    weatherIcon.className = 'weather-icon owf';
    temperature.textContent = '';
    weatherDescription.textContent = '';
    wind.textContent = '';
    humidity.textContent = '';
  } else {
    weatherError.textContent = '';
    weatherIcon.className = 'weather-icon owf';
    weatherIcon.classList.add(`owf-${data.weather[0].id}`);
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    wind.textContent = `wind speed ${Math.round(data.wind['speed'])} m/s`;
    humidity.textContent = `air humidity ${Math.round(data.main.humidity)} %`;
  }
}

// *** Виджет "цитата дня"
// получаю данные/цитаты с json
async function getQuotes() {
  const quotes = 'data.json';
  const res = await fetch(quotes);
  const data = await res.json();
  return data;
}

// *** при загрузке страницы приложения отображается рандомная цитата и её автор +5
const showQuotes = () => {
  const data = getQuotes();
  data.then(function (dataArr) {
    // получить рандомноче число от 0 до длины массива
    let randNum = getRandomNum(0, dataArr.length - 1);
    //беру нужный элемент массива в котором объект
    let resultObj = dataArr[randNum];
    quote.textContent = resultObj['text'];
    author.textContent = resultObj['author'];
  });
};

// *** Аудиоплеер
const playBtn = document.querySelector('.play');
const playPrevBtn = document.querySelector('.play-prev');
const playNextBtn = document.querySelector('.play-next');
const playListUL = document.querySelector('.play-list');
const progressBarAudio = document.querySelector('.progress-audio');
const playNowTitle = document.querySelector('.play-now-title');

const audio = new Audio();
let isPlay = false;
let playNum = 0;

function playAudio() {
  audio.src = playList[playNum].src;
  audio.currentTime = 0;

  updateProgressBar(audio, progressBarAudio);

  audio.play();
  isPlay = true;
  playBtn.classList.add('pause');
  const nowPlay = document.querySelectorAll('.play-item');
  //console.log('сейчас играет, ', nowPlay[playNum]);

  playNowTitle.textContent = `${playList[playNum]['title']}`;

  nowPlay.forEach(el => {
    el.classList.remove('now-play');
  });
  nowPlay[playNum].classList.add('now-play');
}

function updateProgressBar(audioElement, progressBarAudio) {
  // обновление значения прогресс-бара каждые 100 миллисекунд, чтобы отображать текущее время воспроизведения
  setInterval(function () {
    // вычисление процентного соотношения текущего времени воспроизведения к общей длительности аудиофайла
    const progress = (audioElement.currentTime / audioElement.duration) * 100;

    // установка значения прогресс-бара в процентном соотношении
    progressBarAudio.value = `${progress}`;
  }, 100);
}

function pauseAudio() {
  audio.pause();
  isPlay = false;
  playBtn.classList.remove('pause');
}

function playPause() {
  !isPlay ? playAudio() : pauseAudio();
}

function playNext() {
  isPlay = false;
  playNum++;
  if (playNum > playList.length - 1) {
    playNum = 0;
  }
  playAudio();
}

function playPrev() {
  isPlay = false;
  playNum--;
  if (playNum < 0) {
    playNum = playList.length - 1;
  }
  playAudio(playNum);
}

playList.forEach(el => {
  const li = document.createElement('li');
  playListUL.append(li);
  li.classList.add(`play-item`);
  li.textContent = el.title;
});

playBtn.addEventListener('click', playPause);
playPrevBtn.addEventListener('click', playPrev);
playNextBtn.addEventListener('click', playNext);
audio.addEventListener('ended', playNext);

// *** Модальное окно настроек
// Получить элемент кнопки открытия модального окна
const settingsBTN = document.querySelector('.settings');
// Получить элемент модального окна
const modal = document.getElementById('myModal');
// Получить элемент <span>, который используется для закрытия модального окна
const span = document.getElementsByClassName('close')[0];

// Когда пользователь кликает на кнопку, открыть модальное окно
settingsBTN.onclick = function () {
  modal.style.display = 'block';
};

// Когда пользователь кликает на <span> (x), закрыть модальное окно
span.onclick = function () {
  modal.style.display = 'none';
};

// Когда пользователь кликает где-либо вне модального окна, закрыть его
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

// ***
// ***
// ***
// ***
// ***
// ***
// ***
// ***

// ^ дополнительные функции

// &&& SHOW HIDE ELEMENTS
// *** вкл/выкл player
const playerElement = document.querySelector('.player');
const playerBTNElement = document.querySelector('.playerBTN');

function isPlayerShow() {
  playerElement.style.display == 'none'
    ? (playerElement.style.display = 'block')
    : (playerElement.style.display = 'none');
}

playerBTNElement.addEventListener('click', isPlayerShow);

// *** погода
const weatherElement = document.querySelector('.weather');
const WeatherBTNElement = document.querySelector('.WeatherBTN');

function isWeatherShow() {
  weatherElement.style.display == 'none'
    ? (weatherElement.style.display = 'block')
    : (weatherElement.style.display = 'none');
}

WeatherBTNElement.addEventListener('click', isWeatherShow);
// *** дата
const dateElement = document.querySelector('.datatime');
const dateBTNElement = document.querySelector('.dateBTN');

function isDateShow() {
  dateElement.style.display == 'none'
    ? (dateElement.style.display = 'flex')
    : (dateElement.style.display = 'none');
}

dateBTNElement.addEventListener('click', isDateShow);

// *** цитаты
const footerElement = document.querySelector('.footer');
const quotesBTNElement = document.querySelector('.quotesBTN');

function isQuoteShow() {
  footerElement.style.display == 'none'
    ? (footerElement.style.display = 'flex')
    : (footerElement.style.display = 'none');
}

quotesBTNElement.addEventListener('click', isQuoteShow);

// *** Приветсвие
const greetingСontainerElement = document.querySelector('.greeting-container');
const greetingBTNElement = document.querySelector('.greetingBTN');

function isGreetingShow() {
  greetingСontainerElement.style.display == 'none'
    ? (greetingСontainerElement.style.display = 'flex')
    : (greetingСontainerElement.style.display = 'none');
}

greetingBTNElement.addEventListener('click', isGreetingShow);

// *** рандомайзер, с аргументами по умолчанию
function getRandomNum(min = 1, max = 20) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}

// *** перед загрузкой страницы (событие load) данные нужно восстановить и отобразить
function getLocalStorage() {
  if (localStorage.getItem('name')) {
    name.value = localStorage.getItem('name');
  }
  if (localStorage.getItem('city')) {
    city.value = localStorage.getItem('city');
  } else {
    city.value = 'Минск';
    localStorage.setItem('city', city.value);
  }
  getWeather();
}

// *** перед перезагрузкой или закрытием страницы (событие beforeunload) данные нужно сохранить
function setLocalStorage() {
  localStorage.setItem('name', name.value);
  localStorage.setItem('city', city.value);

  localStorage.setItem('isWelcome', playerElement);
  // localStorage.setItem('isMusic', city.value);
  // localStorage.setItem('isWeather', city.value);
  // localStorage.setItem('isQuotes', city.value);
  // localStorage.setItem('isCalendar', city.value);
}

// ^ ==================================== LISTENERS
// *** слушатель на закрытие/перезагрузку. сработает перед закрытием
window.addEventListener('beforeunload', setLocalStorage);

// *** слушатель на презагрузку. сработает перед загрузкой приложения
window.addEventListener('load', getLocalStorage);

// *** слушатель на завершенное изменение (интер и блюр) при завершении редактирования сразу сохранить в локалСторадж
name.addEventListener('change', setLocalStorage);

// *** после редактирования или потери фокуса
city.addEventListener('change', getWeather);

// *** при клике вызывать функцию
changeQuote.addEventListener('click', showQuotes);

// ^ INIT
// *** инициализационный запуск
showTime();
setBg();

showQuotes();

console.log(`
Итоговая оценка: 94/150\n\n

Часы и календарь +15 (сделано +15)\n
Приветствие +10 (сделано +10)\n
Смена фонового изображения +20 (сделано +20)\n
Виджет погоды +15 (сделано +15)\n
Виджет цитата дня +10 (сделано +10)\n
Аудиоплеер +15 (сделано +15)\n
Продвинутый аудиоплеер +20 (частично +6)\n
Перевод приложения на два языка (en/ru или en/be) +15 (не успел)\n
Получение фонового изображения от API +10 (не успел)\n
Настройки приложения +20 (частично +3)\n
Дополнительный функционал на выбор +10 (не успел)\n
`);
