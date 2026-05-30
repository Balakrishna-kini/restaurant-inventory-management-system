@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script for Windows
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET DP0=%~dp0
@SET MAVEN_PROJECTBASEDIR=%DP0%
@SET MVNW_REPOURL=https://repo.maven.apache.org/maven2
@SET WRAPPER_JAR=%DP0%.mvn\wrapper\maven-wrapper.jar
@SET WRAPPER_PROPERTIES=%DP0%.mvn\wrapper\maven-wrapper.properties
@SET DISTRIBUTION_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip

@FOR /F "usebackq tokens=1,2 delims==" %%a IN ("%WRAPPER_PROPERTIES%") DO (
    @IF "%%a"=="distributionUrl" (SET DISTRIBUTION_URL=%%b)
)

@SET JAVA_HOME_CANDIDATE=%JAVA_HOME%
@IF NOT "%JAVA_HOME_CANDIDATE%"=="" (
    @SET JAVA_EXE=%JAVA_HOME_CANDIDATE%\bin\java.exe
) ELSE (
    @SET JAVA_EXE=java
)

@SET MVN_CMD=%JAVA_EXE% -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
@IF NOT EXIST "%WRAPPER_JAR%" (
    @ECHO Downloading Maven Wrapper...
    @%JAVA_EXE% -jar "%WRAPPER_JAR%" --help >NUL 2>&1 || (
        @powershell -Command "Invoke-WebRequest -Uri '%MVNW_REPOURL%/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar' -OutFile '%WRAPPER_JAR%'"
    )
)

%MVN_CMD%
