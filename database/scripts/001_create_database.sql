-- =====================================================================
-- 001_create_database.sql
-- Criação do banco de dados para a Clínica-Escola Senac no SQL Server
-- =====================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'ClinicaEscolaAnamnese')
BEGIN
    CREATE DATABASE ClinicaEscolaAnamnese;
END;
GO

USE ClinicaEscolaAnamnese;
GO
