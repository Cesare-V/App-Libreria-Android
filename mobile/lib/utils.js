// Questa funzione convertirà il createdAt(database) nel formato "Novembre 2025"
export function formatMemberSince(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", {month: "short"});
    const year = date.getFullYear();
    return `${year} ${month} `;
};

// Questa funzione convertirà il createdAt(database) nel formato "Novembre 2025"
export function formatPublishDate(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", {month: "long"});
    const day = date.getDate();
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
};