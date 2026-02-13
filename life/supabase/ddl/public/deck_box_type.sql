create type deck_box_type as enum ('main', 'side', 'ignore', 'extra', 'sealed', 'attachment');

alter type deck_box_type owner to postgres;

