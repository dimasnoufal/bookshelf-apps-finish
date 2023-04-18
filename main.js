document.addEventListener("DOMContentLoaded", () => {
    const submitForm = document.getElementById("inputBook");

    submitForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addBook();
    })

    if(isStorage()){
        loadBooksFromStorage();
    }   

    const submitSearch = document.getElementById("searchBook");

    submitSearch.addEventListener("submit", (e) => {
        e.preventDefault();
        searchBooks();
    })
}
)

document.addEventListener("ondatasaved", () => {
console.log("Data berhasil disimpan.");
});

document.addEventListener("ondataloaded", () => {
refreshBookFromBooks();
});

const INCOMPLETE_BOOKS_LIST = "incompleteBookshelfList";
const COMPLETE_BOOKS_LIST = "completeBookshelfList";
const BOOK_ITEMID = "itemId";

const makeBook = (titleBooks, bookAuthor, bookYear, isComplete) => {
    const textTitle = document.createElement("h3");
    textTitle.innerText = titleBooks;

    const textAuthor = document.createElement("p");
    textAuthor.innerText = "Penulis: " + bookAuthor;

    const textYear = document.createElement("p");
    textYear.innerText = "Tahun: " + bookYear;

    const textContainer =  document.createElement("ARTICLE");
    textContainer.classList.add("book_item");
    textContainer.append(textTitle, textAuthor, textYear);

    const buttonContainer =  document.createElement("div");
    buttonContainer.classList.add("action");

    if (isComplete) {
        buttonContainer.append(createNotFinishedButton("Belum Selesai Dibaca",), createRedButton("Hapus Buku"));
    } else {
        buttonContainer.append(createFinishedButton("Selesai Dibaca"), createRedButton("Hapus Buku"));
    }

    textContainer.append(buttonContainer);

    return textContainer;
}

const addBook = () => {
    const incompleteBooksList = document.getElementById(INCOMPLETE_BOOKS_LIST);
    const completeBooksList = document.getElementById(COMPLETE_BOOKS_LIST); 

    const titleBooks = document.getElementById("inputBookTitle").value;
    const bookAuthor = document.getElementById("inputBookAuthor").value;
    const bookYear = document.getElementById("inputBookYear").value;
    const checkboxValue = document.querySelector('#inputBookIsComplete').checked;

    const bookCreated = makeBook(titleBooks, bookAuthor, bookYear, checkboxValue);
    const bookObject = composeBookObject(titleBooks, bookAuthor, bookYear, checkboxValue);
    bookCreated[BOOK_ITEMID] = bookObject.id;
    books.push(bookObject);


    if (checkboxValue) {
        completeBooksList.append(bookCreated);
        updateBooksToStorage();
    }   else {
        incompleteBooksList.append(bookCreated);
        updateBooksToStorage();
    }
}

const addBookToFinished = (book) => {
    const title = book.querySelector('.book_item > h3').innerText;
    const author = book.querySelectorAll('.book_item > p')[0].innerText.slice(8);
    const year = book.querySelectorAll('.book_item > p')[1].innerText.slice(7);

    const newBook = makeBook(title, author, year, true);
    const bookFound = findBook(book[BOOK_ITEMID]);
    bookFound.isComplete = true;
    newBook[BOOK_ITEMID] = bookFound.id;

    const completeBooksList = document.getElementById(COMPLETE_BOOKS_LIST); 
    completeBooksList.append(newBook);
    book.remove();

    updateBooksToStorage();
}

const addBookToNotFinished = (book) => {
    const title = book.querySelector('.book_item > h3').innerText;
    const author = book.querySelectorAll('.book_item > p')[0].innerText.slice(8);
    const year = book.querySelectorAll('.book_item > p')[1]. innerText.slice(7);

    const newBook = makeBook(title, author, year, false);
    const bookFound = findBook(book[BOOK_ITEMID]);
    bookFound.isComplete = false;
    newBook[BOOK_ITEMID] = bookFound.id;

    const incompleteBooksList = document.getElementById(INCOMPLETE_BOOKS_LIST);
    incompleteBooksList.append(newBook);
    book.remove();
    updateBooksToStorage();
}

const removeBook = (book) => {
    const bookPosition = findBookIndex(book[BOOK_ITEMID]);
    books.splice(bookPosition, 1);
    book.remove();
    updateBooksToStorage();
}

const createButton = (buttonTypeClass, eventListener, text) => {
    const button = document.createElement("button");
    button.innerText = text;
    button.classList.add(buttonTypeClass);
    
    button.addEventListener("click", (e)=>{
        eventListener(e);
    });

    return button;
}

const createNotFinishedButton = (text) => {
    return createButton("green", (e)=>{
        addBookToNotFinished(e.target.parentElement.parentElement);
    }, text)
}

const createFinishedButton = (text) => {
    return createButton("green", (e)=>{
        addBookToFinished(e.target.parentElement.parentElement);
    }, text)
}

const createRedButton = (text) => {
    return createButton("red", (e)=> {
        const message = confirm("Are You Sure Want to Delete the Books?");
        if (message) {
            removeBook(e.target.parentElement.parentElement);
        }
    }, text)
}

const searchBooks = () => {
    const searchValue = document.getElementById("searchBookTitle").value;
    const incompleteBooksList = document.getElementById(INCOMPLETE_BOOKS_LIST);
    const completeBooksList = document.getElementById(COMPLETE_BOOKS_LIST); 
    const previousBooks = document.querySelectorAll(".book_item")

    if (searchValue) {
        for (previousBook of previousBooks) {
            previousBook.remove();
        }

    const filteredBooks = books.filter((book)=>book.title.toLowerCase().includes(searchValue.toLowerCase()));

    for (book of filteredBooks) {
        const newBook = makeBook(book.title, book.author, book.year, book.isComplete);
        newBook[BOOK_ITEMID] = book.id;

        if (book.isComplete) {
            completeBooksList.append(newBook);
        } else {
            incompleteBooksList.append(newBook);
        }
    }
    } else {
        for (previousBook of previousBooks) {
            previousBook.remove();
        }
        loadBooksFromStorage();
    }
    
    return books;
}

const STORAGE_KEY = "BOOK_APPS"
let books = [];

const isStorage = () => {
    if(typeof(Storage) === undefined){
        alert("Browser kamu tidak mendukung local storage");
        return false
    }
    return true;
}

const composeBookObject = (title, author, year, isComplete) => {
    return {
        id: +new Date(),
        title,
        author,
        year,
        isComplete
    };
}

const findBook = (bookId) => {
    for(book of books){
        if(book.id === bookId)
            return book;
    }
    return null;
}

function findBookIndex(bookId) {
    let index = 0
    for (book of books) {
        if(book.id === bookId)
            return index;
        index++;
    }

    return -1;
}

const saveBooks = () => {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event("ondatasaved"));
}

const loadBooksFromStorage = () => {
    const getBooks = localStorage.getItem(STORAGE_KEY);
    
    let data = JSON.parse(getBooks);
    
    if(data !== null) {
        books = data;
    }

    document.dispatchEvent(new Event("ondataloaded"));
}

const updateBooksToStorage = () => {
    if(isStorage()) {
        saveBooks();
    };
}

const refreshBookFromBooks = () => {
    const incompleteBooksList = document.getElementById(INCOMPLETE_BOOKS_LIST);
    const completeBooksList = document.getElementById(COMPLETE_BOOKS_LIST); 

    for (book of books) {
        const newBook = makeBook(book.title, book.author, book.year, book.isComplete);
        newBook[BOOK_ITEMID] = book.id;

        if (book.isComplete) {
            completeBooksList.append(newBook);
        } else {
            incompleteBooksList.append(newBook);
        }
    }
}
