const likeButtonActiveClass = "card__like-button_is-active";

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const isCardLiked = (likes, currentUserId) => {
  return likes.some((likeItem) => likeItem._id === currentUserId);
};

export const updateCardLikes = (cardElement, likes, currentUserId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");

  likeCount.textContent = likes.length;
  likeButton.classList.toggle(likeButtonActiveClass, isCardLiked(likes, currentUserId));
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { currentUserId, onPreviewPicture, onLikeCard, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  updateCardLikes(cardElement, data.likes, currentUserId);

  if (onLikeCard) {
    likeButton.addEventListener("click", () => onLikeCard(data, cardElement));
  }

  if (data.owner._id === currentUserId) {
    deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
  } else {
    deleteButton.remove();
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};
