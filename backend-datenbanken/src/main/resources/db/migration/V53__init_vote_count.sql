create table vote_count (
    total_votes bigint not null,
    election_id bigint not null references elections(id),
    constraint pk_vote_count primary key (election_id)
);

INSERT INTO vote_count (total_votes, election_id)
SELECT 0, e.id
FROM elections e
where e.status = 'ACTIVE'