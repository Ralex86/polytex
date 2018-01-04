CREATE TABLE DISCUSSION (
    id int NOT NULL AUTO_INCREMENT,
    username VARCHAR(50),
    body text,
    latex tinyint(1),
    PRIMARY KEY (id)
);
