pipeline {
    agent any
    environment {
        SCANNER_HOME = '/opt/sonar-scanner'
        ODC_HOME = '/opt/dependency-check'
        // Using the NVD API Key as an environment variable
        NVD_API_KEY = '8613479c-ad4f-4ed9-b39f-7346f723a600'
    }
    stages {
        stage('Universal Checkout') {
            steps { 
                checkout scm 
            }
        }

        stage('Multi-Tool Security Scan') {
            parallel {
                stage('Secret Scan') {
                    steps {
                        // Gitleaks identifies hardcoded secrets and redacts them in the logs
                        sh 'gitleaks detect --source . --verbose --redact || true'
                    }
                }
                stage('SAST (Pro Semgrep)') {
                    steps {
                        // Advanced Semgrep scan using industry-standard security policies
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
                        // Using a 10s delay and 2m timeout to satisfy NVD/Cloudflare rate limits
                        sh """
                            ${ODC_HOME}/bin/dependency-check.sh \
                                --project 'Universal-Scan' \
                                --scan . \
                                --format 'ALL' \
                                --out . \
                                --nvdApiKey ${NVD_API_KEY} \
                                --nvdApiDelay 10000 \
                                --connectionTimeout 120000 || true
                        """
                    }
                }
            }
        }

        stage('SonarQube Global Analysis') {
            steps {
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
                // Fails the build if SonarQube marks the code as 'Failing'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
    post {
        always {
            // Archiving all professional security reports for documentation
            archiveArtifacts artifacts: 'semgrep-report.txt, dependency-check-report.html, *.json, *.txt', allowEmptyArchive: true
        }
    }
}
