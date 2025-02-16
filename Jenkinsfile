pipeline {
    agent any
    stages {
        stage('Clone'){
            steps{
                print "clone"
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [ [
                        credentialsId: 'Sorayut',
                        url: 'https://github.com/SorayutChroenrit/FRONTNED401.git'
                    ] ]
                ])
                print "Checkout success"
            }
        }
    }
    stages {
        stage('Build'){
            steps{
                print "Jenkins Build"
            }
        }
    }
    stages {
        stage('Testing'){
            steps{
                print "Jenkins Testing"
            }
        }
    }
}