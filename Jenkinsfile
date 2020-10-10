pipeline {
  environment {
    dockerRegistry = "kansarak/webapp"
    dockerRegistryCredential = 'jenkins_docker_login'
    dockerImage = ''
  }
  agent any
  tools {nodejs "node" }
  stages {
    stage('Show GIT_URL') {
      steps {
        sh "echo ${env.GIT_URL}"
      }
    }
    stage('Cloning Git') {
      steps {
        git credentialsId: 'git_fork_private_key', url: "${env.GIT_URL}"
      }
    }
    stage('Build') {
       steps {
         sh 'npm install'
       }
    }
    stage('Get last git commit') {
       steps {
           script {
                git_hash = sh(returnStdout: true, script: "git rev-parse HEAD").trim()
           }
       }
    }
    stage('Building image') {
       steps{
         script {
           dockerImage = docker.build dockerRegistry + ":${git_hash}"
         }
       }
     }
     stage('Upload Image') {
       steps{
         script {
           docker.withRegistry( '', dockerRegistryCredential ) {
             dockerImage.push("${git_hash}")
             dockerImage.push("latest")
           }
         }
       }
     }
     stage('Remove Unused docker image') {
       steps{
         sh "docker rmi $dockerRegistry:${git_hash}"
       }
     }
  }
}