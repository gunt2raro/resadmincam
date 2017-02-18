app
    .factory( 'ReservationCabinRepository', [ '$http', function( $http ) {
        return({
            getAll : function( calendar ) {
                var date_1 = calendar.date_start.getFullYear() + '-' + ( calendar.date_start.getMonth() + 1 ) + '-' + ( calendar.date_start.getDate() + 1 ),
                    date_2 = calendar.date_end.getFullYear() + '-' + ( calendar.date_end.getMonth() + 1 ) + '-' + calendar.date_end.getDate();
                return $http({
                    url : '/reservation/cabin?d1=' + date_1 + '&d2=' + date_2,
                    method : 'GET'
                });
            },
            add : function( data ) {
                return $http({
                    url : '/reservation/cabin',
                    method : 'POST',
                    data : JSON.stringify( data )
                });
            },
            getById : function( id ) {
                return $http({
                    url : '/reservation/cabin/' + id,
                    method : 'GET'
                });
            },
            update : function( data ) {
                return $http({
                    url : '/reservation/' + data.id,
                    method : 'PUT',
                    data : JSON.stringify( data )
                });
            },
            remove : function( id ) {
                return $http({
                    url : '/reservation/cabin/' + id,
                    method : 'DELETE'
                });
            },
            getCabinsByDate : function( data ) {
                var date_1 = data.date_start.getFullYear() + '-' + ( data.date_start.getMonth() + 1 ) + '-' + data.date_start.getDate(),
                    date_2 = data.date_end.getFullYear() + '-' + ( data.date_end.getMonth() + 1 ) + '-' + data.date_end.getDate();
                return $http({
                    url : '/reservation/cabins?d1=' + date_1 + '&d2=' + date_2,
                    method : 'GET'
                });
            },
            validateReservationInfo : function( data, scope ) {
                var ban = true;
                scope.errors = "";
                if( data.full_name.length == 0 || data.full_name.length > 200 ) {
                    ban = false;
                    scope.errors += "Por favor seleccione un nombre completo válido.";
                }
                if( data.email.length == 0 || data.email.length > 500 ) {
                    ban = false;
                    scope.errors += "Por favor seleccione un correo eléctronico válido.";
                }
                if( data.phone_number.length == 0 || data.phone_number.length > 100 ) {
                    ban = false;
                    scope.errors += "Por favor seleccione un teléfono válido.";
                }
                return ban;
            }
        });
    }])
    .controller( 'reservation-cabin-controller',
                [   '$scope',
                    '$filter',
                    '$mdDialog',
                    '$location',
                    '$routeParams',
                    'AuthRepository',
                    'uiCalendarConfig',
                    'CabinRepository',
                    'PromotionRepository',
                    'ReservationCabinRepository',
                    function(
                        $scope,
                        $filter,
                        $mdDialog,
                        $location,
                        $routeParams,
                        AuthRepository,
                        uiCalendarConfig,
                        CabinRepository,
                        PromotionRepository,
                        ReservationCabinRepository ) {

        if( AuthRepository.viewVerification() ) {

            $scope.title = "Reservaciones";

            $scope.ticket_price_child = 30;
            $scope.ticket_price_adult = 60;

            if( $routeParams.id ) {

                ReservationCabinRepository.getById( $routeParams.id ).success( function( data ) {
                    if( !data.error ){
                        $scope.reservation = data.data;
                    } else {
                        $scope.errors = data.message;
                    }
                }).error( function( error ) {
                    $scope.errors = error;
                });

                $scope.print = function() {
                    var d1 = new Date( $scope.reservation.date_start ),
                        d2 = new Date( $scope.reservation.date_end ),
                        days = Math.ceil( Math.abs( d2.getTime() - d1.getTime() ) / ( 1000 * 3600 * 24 ) );
                    var docDefinition = {
                        header: {
                            columns: [
                                { text: 'Balneario Las Palmas', style: 'header' },
                                { text: $filter( 'dateTimeFilter' ) ( $scope.reservation.timestamp ), alignment: 'right' }
                            ]
                        },
                        footer: {
                            columns: [
                                'Este recibo se debe mostrar en la entrada.',
                                { text: 'Todos los derechos reservados.', alignment: 'right' }
                            ]
                        },
                        content: [
                            '\n',
                            { text : 'Información del Cliente', style: 'title' },
                            '\n',
                            { text: 'Nombre : ' + $scope.reservation.reservation_info.full_name, style: 'info' },
                            '\n',
                            { text: 'e-mail : ' + $scope.reservation.reservation_info.email, style: 'info' },
                            '\n',
                            {
                                columns : [
                                    {
                                        width: 'auto',
                                        text: 'Teléfono : ' + $scope.reservation.reservation_info.phone_number,
                                        style : 'info'
                                    },
                                    {
                                        width: 'auto',
                                        text: 'Código Postal : ' + $scope.reservation.reservation_info.zip_code,
                                        style : 'info'
                                    }
                                ],
                                columnGap: 10
                            },
                            '\n',
                            {
                                columns : [
                                    {
                                        width: 'auto',
                                        text: 'Ciudad : ' + $scope.reservation.reservation_info.city,
                                        style : 'info'
                                    },
                                    {
                                        width: 'auto',
                                        text: 'Estado : ' + $scope.reservation.reservation_info.state,
                                        style : 'info'
                                    },
                                    {
                                        width: 'auto',
                                        text: 'País : ' + $scope.reservation.reservation_info.country,
                                        style : 'info'
                                    }
                                ],
                                columnGap: 10
                            },
                            '\n',
                            { text : 'Detalle de Reservación', style: 'title' },
                            '\n',
                            {
                                table: {
                                    headerRows: 1,
                                    widths: [ '*', '*' ],
                                    body: [
                                        [
                                            { text: 'Fecha entrada', bold: true },
                                            { text: 'Fecha de salida', bold: true }
                                        ],
                                        [ $filter( 'dateFilter' ) ( $scope.reservation.date_start ) + ' 14:00 hrs', $filter( 'dateFilter' ) ( $scope.reservation.date_end ) + ' 13:00 hrs' ]
                                    ]
                                }
                            },
                            '\n',
                            {
                                table: {
                                    headerRows: 1,
                                    widths: [ '*', 100, 100, '*' ],
                                    body: [
                                        [
                                            { text: 'Detalle', bold: true },
                                            { text: 'P/U', bold: true },
                                            { text: 'Cantidad', bold: true },
                                            { text: 'Sub Total', bold: true }
                                        ],
                                        [ 'Máximo de personas', '$ 0.00', '' + $scope.reservation.max_guests, '$ 0.00' ],
                                        [ 'Boletos Extra Niños', '$ ' + parseFloat( $scope.ticket_price_child ), '' + $scope.reservation.extra_guests_child, '$ ' + parseFloat( $scope.reservation.extra_guests_child * $scope.ticket_price_child ) ],
                                        [ 'Boletos Extra Adultos', '$ ' + parseFloat( $scope.ticket_price_adult ), '' + $scope.reservation.extra_guests_adult, '$ ' + parseFloat( $scope.reservation.extra_guests_adult * $scope.ticket_price_adult ) ]
                                    ]
                                }
                            },
                            '\n',
                            { text: 'Sub Total : ' + '$ ' + ( $scope.reservation.total / days ), style : { fontSize : 16, alignment: 'right' } },
                            '\n',
                            { text: ' Por ' + days + ' noches', style : { fontSize : 14, bold:true, alignment: 'right' } },
                            '\n',
                            { text: 'Total : ' + '$ ' + $scope.reservation.total, style : 'total' }
                        ],
                        styles: {
                            header: {
                                fontSize: 18,
                                bold: true
                            },
                            title : {
                                fontSize : 18
                            },
                            total : {
                                fontSize : 18,
                                alignment : 'right'
                            },
                            info : {
                                fontSize : 12
                            }
                        }
                    };
                    $scope.reservation.details.forEach( function( detail, index ) {
                        docDefinition.content[15].table.body.push([
                            detail.product.name,
                            '$ ' + detail.product.price,
                            '' + detail.qty,
                            '$ ' + ( detail.product.price * detail.qty )
                        ]);
                    });
                    pdfMake.createPdf(docDefinition).download("Score_Details.pdf");
                };

            } else {

                var getCabins = function() {
                    ReservationCabinRepository.getCabinsByDate($scope.date_data).success( function( data ) {
                        if( !data.error ) {
                            var the_data = data.data;
                            $scope.cabins = the_data;
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                };

                var getAllPromotions = function() {
                    PromotionRepository.getAll().success( function( data ) {
                        if( !data.error ) {
                            var the_data = data.data;
                            $scope.promotions = the_data.data;
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                };

                var getAllReservations = function( calendar ) {
                    ReservationCabinRepository.getAll( calendar ).success( function( data ) {
                        if( !data.error ) {
                            $scope.reservations = data.data;
                            $scope.events.length = 0;
                            $scope.reservations.forEach( function( item, index ) {
                                item.details.forEach( function( product, index ) {
                                    var date1 = new Date(item.date_start), date2 = new Date(item.date_end);
                                    date1.setDate( date1.getDate() + 1 );
                                    date2.setDate( date2.getDate() + 2 );
                                    $scope.events.push({
                                        title : product.product.name,
                                        start: new Date( date1 ),
                                        end: new Date( date2 ),
                                        allDay: true
                                    });
                                });
                            });
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                };
                /* alert on eventClick */
                $scope.alertOnEventClick = function( date, jsEvent, view){
                    $scope.alertMessage = (date.title + ' was clicked ');
                };
                /* alert on Drop */
                $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
                    $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
                };
                /* alert on Resize */
                $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
                    $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
                };
                /* add and removes an event source of choice */
                $scope.addRemoveEventSource = function(sources,source) {
                    var canAdd = 0;
                    angular.forEach(sources,function(value, key){
                        if(sources[key] === source){
                            sources.splice(key,1);
                            canAdd = 1;
                        }
                    });
                    if(canAdd === 0){
                        sources.push(source);
                    }
                };
                $scope.eventRender = function( event, element, view ) {
                    element.attr({'tooltip': event.title,
                        'tooltip-append-to-body': true});
                };
                /* config object */
                $scope.uiConfig = {
                    calendar:{
                        height: 450,
                        editable: false,
                        header:{
                            left: 'title',
                            center: '',
                            right: 'today prev,next'
                        },
                        eventClick: $scope.alertOnEventClick,
                        eventDrop: $scope.alertOnDrop,
                        eventResize: $scope.alertOnResize,
                        eventRender: $scope.eventRender,
                        viewRender: function(view, element) {
                            getAllReservations( { date_start : view.start._d, date_end : view.end._d } );
                        }
                    }
                };

                $scope.events = [];
                $scope.eventSources = [ $scope.events ];

                $scope.reservation = {
                    total : 0,
                    max_guests : 0,
                    max_extra_guests : 0,
                    date_start : "",
                    date_end : "",
                    reservation_type : 1,
                    promotion : {},
                    details : [],
                    extra_guests_child : 0,
                    extra_guests_adult : 0,
                    reservationinfo : {
                        full_name : "",
                        email : "",
                        address1 : "",
                        address2 : "",
                        zip_code : 0,
                        state : "",
                        country : "México",
                        city : "",
                        phone_number : ""
                    }
                };

                $scope.date_data = {
                    date_start : "",
                    date_end : ""
                };

                $scope.addNewDetail = function() {
                    if( $scope.cabins ) {
                        $scope.reservation.details.push( { id : 0, product : {}, qty : 1 } );
                    } else {
                        alert( "Selecciona una fecha." );
                    }
                };

                var set_dates = function() {
                    var d_s_txt = document.getElementById( 'date_start' ).value,
                        d_e_txt = document.getElementById( 'date_end' ).value;
                    if( d_s_txt && d_e_txt ) {
                        $scope.date_data.date_start = new Date( d_s_txt );
                        $scope.date_data.date_end = new Date( d_e_txt );
                        return true;
                    }return false;
                };

                var calculate_total = function() {
                    var d_s = $scope.date_data.date_start,
                        d_e = $scope.date_data.date_end,
                        days = Math.round( ( d_e - d_s ) / ( 1000 * 60 * 60 * 24 ) ),
                        sum = $scope.reservation.details.map( d => parseInt( d.product.price ) ).reduce( ( a, b ) => ( a + b ), 0 );
                    $scope.reservation.max_guests = $scope.reservation.details.map( d => parseInt( d.product.cabin_type.max_guests ) ).reduce( ( a, b ) => ( a + b ), 0 );
                    $scope.reservation.max_extra_guests = $scope.reservation.details.map( d => parseInt( d.product.cabin_type.max_extra_guests ) ).reduce( ( a, b ) => ( a + b ), 0 );
                    $scope.reservation.total = days * ( ( sum ) + ( $scope.reservation.extra_guests_adult * $scope.ticket_price_adult ) + ( $scope.reservation.extra_guests_child * $scope.ticket_price_child ) );
                };

                $scope.onDateChange = function() {
                    if( set_dates() ) {
                        calculate_total();
                        getCabins();
                    }
                };

                $scope.onSelectChange = function() {
                    if( set_dates() ) {
                        calculate_total();
                    }
                };
                $scope.reserve = function() {
                    if( $scope.reservation.details.length > 0 ) {
                        if( ReservationCabinRepository.validateReservationInfo( $scope.reservation.reservationinfo, $scope ) ) {
                            $scope.reservation.date_start = document.getElementById('date_start').value;
                            $scope.reservation.date_end = document.getElementById('date_end').value;
                            ReservationCabinRepository.add( $scope.reservation ).success( function( data ) {
                                if( !data.error ) {
                                    $location.path( "/reservations/cabin" );
                                } else {
                                    $scope.errors = data.message;
                                }
                            }).error( function( error ) {
                                $scope.errors = error;
                            });
                        } else {
                            alert( "Por favor llene válidamente la información de reservación." );
                        }
                    } else {
                        alert( "Por favor seleccione alguna cabaña para reservar." );
                    }
                };

                $scope.delete = function( e, id ) {
                    var confirm = $mdDialog.confirm()
                        .title('¿Desea borrar el registro?')
                        .textContent("Después de borrar esto no podrá ser recuperado.")
                        .ariaLabel('Lucky day')
                        .targetEvent(e)
                        .ok('Borrar Reservación')
                        .cancel('Cancelar');

                    $mdDialog.show(confirm).then(function() {
                        ReservationCabinRepository.remove( id ).success( function( data ) {
                            if( !data.error ) {
                                $location.path( "/reservations/cabin" );
                            } else {
                                $scope.errors = data.message;
                            }
                        }).error( function(error) {
                            $scope.errors =  "Ha habido un error.";
                        });
                    }, null );
                };
            }
        }

    }]);