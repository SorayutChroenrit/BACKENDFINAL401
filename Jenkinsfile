pipeline {
    agent any
    stages {
        stage('Clone') {
            steps {
                script {
                    print "Cloning repository..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],pipeline {
    agent {
        docker {
            image 'docker:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    stages {
        stage('Clone') {
            steps {
                script {
                    echo "Cloning repository..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            credentialsId: 'Sorayut',
                            url: 'https://github.com/SorayutChroenrit/FRONTNED401.git'
                        ]]
                    )
                    echo "Checkout successful"
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    echo "Docker Build Image"
                    sh 'docker build -t frontend401 .'
                    echo "Docker Build Image Success"
                }
            }
        }

        stage('Run Container') {
            steps {
                script {
                    echo "Docker Image to Running Container"
                    sh "docker rm -f frontend401-run || true"
                    sh "docker run -d --name frontend401-run -p 54100:3000 frontend401:latest"
                    echo "Docker Image to Running Container Success"
                }
            }
        }

        stage('Testing') {
            steps {
                echo "Jenkins Testing"
            }
        }
    }
}
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
