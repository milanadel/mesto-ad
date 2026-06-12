/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {
  addCard,
  changeLikeStatus,
  deleteCard as deleteCardFromServer,
  getCardList,
  getUserInfo,
  updateUserAvatar,
  updateUserInfo,
} from "./components/api.js";
import { createCardElement, deleteCard, updateCardLikes } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const logoElement = document.querySelector(".header__logo");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const deleteCardModalWindow = document.querySelector(".popup_type_remove-card");
const deleteCardForm = deleteCardModalWindow.querySelector(".popup__form");

const cardsStatsModalWindow = document.querySelector(".popup_type_info");
const cardsStatsInfoList = cardsStatsModalWindow.querySelector(".popup__info");
const cardsStatsList = cardsStatsModalWindow.querySelector(".popup__list");

const infoItemTemplate = document
  .getElementById("popup-info-definition-template")
  .content.querySelector(".popup__info-item");
const previewItemTemplate = document
  .getElementById("popup-info-user-preview-template")
  .content.querySelector(".popup__list-item");

let currentUserId = null;
let cardForDeleting = null;

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const setProfileData = ({ name, about, avatar }) => {
  profileTitle.textContent = name;
  profileDescription.textContent = about;
  profileAvatar.style.backgroundImage = `url(${avatar})`;
};

const renderLoading = (submitButton, isLoading, loadingText) => {
  if (isLoading) {
    submitButton.dataset.defaultText = submitButton.textContent;
    submitButton.textContent = loadingText;
    return;
  }

  submitButton.textContent = submitButton.dataset.defaultText;
};

const buildInfoItem = (term, value) => {
  const itemElement = infoItemTemplate.cloneNode(true);

  itemElement.querySelector(".popup__info-term").textContent = term;
  itemElement.querySelector(".popup__info-description").textContent = value;

  return itemElement;
};

const buildPreviewItem = (cardName) => {
  const previewElement = previewItemTemplate.cloneNode(true);

  previewElement.textContent = cardName;

  return previewElement;
};

// Вариант 3: статистика карточек группы в виде пар «подпись → значение».
const getCardsStatistics = (cards) => {
  const likesByAuthor = {};

  for (const card of cards) {
    const { _id, name } = card.owner;
    const previousLikes = likesByAuthor[_id]?.likes ?? 0;

    likesByAuthor[_id] = { name, likes: previousLikes + card.likes.length };
  }

  const authors = Object.values(likesByAuthor);
  const topAuthor = authors.length
    ? authors.reduce((leader, author) => (author.likes > leader.likes ? author : leader))
    : { name: "—", likes: 0 };

  const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);

  return {
    "Всего пользователей:": authors.length,
    "Всего лайков:": totalLikes,
    "Максимально лайков от одного:": topAuthor.likes,
    "Чемпион лайков:": topAuthor.name,
  };
};

// Названия трёх самых залайканных карточек.
const getPopularCardNames = (cards) =>
  cards
    .slice()
    .sort((firstCard, secondCard) => secondCard.likes.length - firstCard.likes.length)
    .filter((card) => card.likes.length > 0)
    .slice(0, 3)
    .map((card) => card.name);

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Сохранение...");
  updateUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      setProfileData(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch(console.error)
    .finally(() => renderLoading(submitButton, false));
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Сохранение...");
  updateUserAvatar(avatarInput.value)
    .then((userData) => {
      setProfileData(userData);
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch(console.error)
    .finally(() => renderLoading(submitButton, false));
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Создание...");
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      renderCard(cardData, "prepend");
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch(console.error)
    .finally(() => renderLoading(submitButton, false));
};

const handleDeleteCard = (cardId, cardElement) => {
  cardForDeleting = { cardId, cardElement };
  openModalWindow(deleteCardModalWindow);
};

const handleDeleteCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  if (!cardForDeleting) {
    return;
  }

  renderLoading(submitButton, true, "Удаление...");
  deleteCardFromServer(cardForDeleting.cardId)
    .then(() => {
      deleteCard(cardForDeleting.cardElement);
      closeModalWindow(deleteCardModalWindow);
      cardForDeleting = null;
    })
    .catch(console.error)
    .finally(() => renderLoading(submitButton, false));
};

const handleLikeCard = (cardData, cardElement) => {
  const isLiked = cardData.likes.some((likeItem) => likeItem._id === currentUserId);

  changeLikeStatus(cardData._id, isLiked)
    .then((updatedCard) => {
      cardData.likes = updatedCard.likes;
      updateCardLikes(cardElement, updatedCard.likes, currentUserId);
    })
    .catch(console.error);
};

const renderCard = (cardData, method = "append") => {
  const cardElement = createCardElement(cardData, {
    currentUserId,
    onPreviewPicture: handlePreviewPicture,
    onLikeCard: handleLikeCard,
    onDeleteCard: handleDeleteCard,
  });

  placesWrap[method](cardElement);
};

const renderCardsStatistics = (cards) => {
  const statistics = getCardsStatistics(cards);

  cardsStatsInfoList.replaceChildren();
  Object.entries(statistics).forEach(([term, value]) => {
    cardsStatsInfoList.append(buildInfoItem(term, value));
  });

  cardsStatsList.replaceChildren();
  getPopularCardNames(cards).forEach((cardName) => {
    cardsStatsList.append(buildPreviewItem(cardName));
  });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      renderCardsStatistics(cards);
      openModalWindow(cardsStatsModalWindow);
    })
    .catch(console.error);
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
deleteCardForm.addEventListener("submit", handleDeleteCardFormSubmit);
logoElement.addEventListener("click", handleLogoClick);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    setProfileData(userData);
    cards.forEach((cardData) => renderCard(cardData));
  })
  .catch(console.error);
