CREATE TABLE IF NOT EXISTS TASKS 
(
    id NUMBER(10) NOT NULL,
    name VARCHAR2(1500) NOT NULL,
    search VARCHAR2(1500),
    createdBy VARCHAR2(150),
    createdAt DATE,
    updatedBy VARCHAR2(150),
    updatedAt DATE,
    CONSTRAINT id_pk PRIMARY KEY (id)
);