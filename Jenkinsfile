pipeline {
    agent any

    environment {
        SCANNER_HOME = '/opt/sonar-scanner'
        ODC_HOME = '/opt/dependency-check'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Secret Scanning (GitLeaks)') {
            steps {
                echo "Running GitLeaks..."
                // Generates a JSON report for archiving
                sh 'gitleaks detect --source . --verbose --redact --report-path gitleaks-report.json || true'
            }
        }

        stage('SAST Scanning (Semgrep)') {
            steps {
                echo "Running Semgrep..."
                // Generates a text report that is very easy to read
                sh 'semgrep scan --config auto --text -o semgrep-report.txt || true'
            }
        }

        stage('SCA Scanning (Dependency-Check)') {
            steps {
                echo "Running OWASP Dependency-Check..."
                // Note: --format ALL generates HTML, XML, and JSON
                sh "${ODC_HOME}/bin/dependency-check.sh --project 'DevSecOps-Lab' --scan . --format 'ALL' --out . || true"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo "Pushing results to SonarQube..."
                withSonarQubeEnv('SonarQube-Server') {
                    sh "${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=devsecops-vulnerable-lab \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000"
                }
            }
        }
    }
    
    post {
        always {
            // This is the MAGIC part. It attaches the reports to your Jenkins Build page.
            archiveArtifacts artifacts: 'gitleaks-report.json, semgrep-report.txt, dependency-check-report.html', allowEmptyArchive: true
            echo "Security Pipeline Finished. Check 'Build Artifacts' for your reports!"
        }
    }
}
