create table usuarios (
    id serial primary key,
    nome varchar(60) not null,
    sobrenome varchar(60) not null,
    matricula varchar(32) not null,
    curso int not null,
    data_nascimento date not null
);

create table cursos (
    id serial primary key,
    nome varchar(100) not null,
    codigo varchar(32) not null,
    descricao text
);

create table matricula (
    id serial primary key,
    usuario_id 
    curso_id
    data_inicio
    data_fim
)
idusuario_id
curso_id
data_inicio
data_fim

