CREATE TABLE IF NOT EXISTS TASKS (id INTEGER GENERATED ALWAYS AS IDENTITY, "name" VARCHAR2(1500) NOT NULL, search VARCHAR2(1500), createdBy VARCHAR2(150), createdAt DATE, udatedBy VARCHAR2(150), updatedAt DATE, CONSTRAINT id_pk PRIMARY KEY (id))