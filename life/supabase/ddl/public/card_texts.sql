create table card_texts
(
    id       uuid default gen_random_uuid() not null primary key,
    card_id  text                           not null references cards,
    language text                           not null references languages,
    name     text                           not null,
    subname  text,
)