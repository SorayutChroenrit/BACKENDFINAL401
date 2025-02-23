pipeline {
    agent any
    stages {
        stage('Clone') {
            steps {
                script {
                    print "Cloning repository..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                                credentialsId: 'Sorayut',
                            url: 'https://github.com/SorayutChroenrit/FRONTNED401.git'
                        ]]
                    ])
                    print "Checkout successful"
                }
            }
        }
        
        stage('Build') {
            steps {
                print "Docker Build Image"
                script {
                    sh 'docker build -t frontend401 .'
                    print "Docker Build Image Success"
                }

                print "Docker Image to Running Container"
                script {
                    sh "docker rm -f frontend401-run || true"
                    sh "docker run -d --name frontend401-run -p 54100:3000 frontend401:lastest"
                    print "Docker Image to Running Container Success"
                }
            }
        }
        
        stage('Testing') {
            steps {
                print "Jenkins Testing"
            }
        }
    }
}
