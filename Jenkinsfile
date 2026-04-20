pipeline {
    agent any
    environment {
        SCANNER_HOME = '/opt/sonar-scanner'
        ODC_HOME = '/opt/dependency-check'
    }
    stages {
        stage('Universal Checkout') {
            steps { checkout scm }
        }

        stage('Multi-Tool Security Scan') {
            parallel {
                stage('Secret Scan') {
                    steps {
                        // Redacting secrets in logs for professional reporting
                        sh 'gitleaks detect --source . --verbose --redact || true'
                    }
                }
                stage('SAST (Pro Semgrep)') {
                    steps {
                        // Using specialized rule-sets and saving to a human-readable text file
                        sh '''
                            semgrep scan \
                                --config p/security-audit \
                                --config p/owasp-top-10 \
                                --config p/javascript \
                                --config p/nodejsscan \
                                --text \
                                --metrics=off \
                                --output=semgrep-report.txt \
                                --error || true
                        '''
                    }
                }
                stage('SCA (Dependency Check)') {
                    steps {
                        sh "${ODC_HOME}/bin/dependency-check.sh --project 'Universal-Scan' --scan . --format 'ALL' --out . || true"
                    }
                }
            }
        }

        stage('SonarQube Global Analysis') {
            steps {
                // Fixed the naming issue with double quotes for the projectKey
                withSonarQubeEnv('SonarQube-Server') {
                    sh "${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey='${JOB_NAME}' \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000"
                }
            }
        }

        stage("Quality Gate Enforcement") {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
    post {
        always {
            // Explicitly archiving the human-readable semgrep report and ODC HTML
            archiveArtifacts artifacts: 'semgrep-report.txt, dependency-check-report.html, *.json', allowEmptyArchive: true
        }
    }
}
